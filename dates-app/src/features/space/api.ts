import { mapSpaceRow } from "@/features/space/types"
import type { Space, SpaceMember } from "@/features/space/types"
import { listMediaForSpace, deleteMedia } from "@/lib/media/api"
import { profileDisplayName } from "@/lib/profile-display-name"
import { supabase } from "@/lib/supabase"

interface SpaceResult {
  space: Space | null
  error: string | null
}

interface SpaceActionResult {
  error: string | null
}

interface SpaceMembersResult {
  members: SpaceMember[]
  error: string | null
}

function toMemberRole(value: string): "owner" | "member" {
  return value === "owner" ? "owner" : "member"
}

/**
 * Duas consultas, não um embed — a relação space_members -> spaces é
 * many-to-one, mas resolver em dois passos simples é mais direto de ler do
 * que depender de inferência de tipo de embed do PostgREST.
 */
export async function fetchSpaceForUser(profileId: string): Promise<SpaceResult> {
  const { data: membership, error: membershipError } = await supabase
    .from("space_members")
    .select("space_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle()

  if (membershipError) return { space: null, error: membershipError.message }
  if (!membership) return { space: null, error: null }

  const { data: spaceRow, error: spaceError } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", membership.space_id)
    .single()

  if (spaceError || !spaceRow) {
    return { space: null, error: spaceError?.message ?? "Espaço não encontrado." }
  }

  return { space: mapSpaceRow(spaceRow), error: null }
}

/**
 * Três passos, não uma função de banco: primeiro `spaces` (o criador se
 * declara dono via owner_id), depois `space_members` (a policy de insert
 * exige que `spaces.owner_id` já seja o usuário atual — ver
 * supabase/migrations/007_rls.sql), só então lemos a linha criada.
 *
 * O id é gerado aqui, não pelo banco: o primeiro insert não pode pedir
 * `.select()`/RETURNING, porque a policy de SELECT de `spaces` exige
 * `is_space_member`, que só passa a ser verdade depois do insert em
 * `space_members` — pedir a linha de volta antes disso faz o Postgres
 * rejeitar o insert inteiro por RLS, mesmo o `with_check` de
 * `spaces_insert_as_owner` já tendo passado.
 *
 * Se o segundo insert falhar, o espaço fica sem membership; aceitável
 * nesta fase porque, sem Convites ainda, o único membro possível é o
 * próprio dono, e o erro é reportado para ele tentar de novo.
 */
export async function createSpace(name: string, ownerId: string): Promise<SpaceResult> {
  const spaceId = crypto.randomUUID()

  const { error: spaceError } = await supabase
    .from("spaces")
    .insert({ id: spaceId, name, owner_id: ownerId })

  if (spaceError) {
    return { space: null, error: spaceError.message }
  }

  const { error: memberError } = await supabase
    .from("space_members")
    .insert({ space_id: spaceId, profile_id: ownerId, role: "owner" })

  if (memberError) {
    return { space: null, error: memberError.message }
  }

  const { data: spaceRow, error: fetchError } = await supabase
    .from("spaces")
    .select()
    .eq("id", spaceId)
    .single()

  if (fetchError || !spaceRow) {
    return { space: null, error: fetchError?.message ?? "Não foi possível carregar o espaço criado." }
  }

  return { space: mapSpaceRow(spaceRow), error: null }
}

export async function updateSpaceName(spaceId: string, name: string): Promise<SpaceActionResult> {
  const { error } = await supabase.from("spaces").update({ name }).eq("id", spaceId)
  return { error: error?.message ?? null }
}

/** Duas consultas, mesmo padrão de `fetchExperiencesForSpace` — quem participa do espaço, com nome/e-mail já resolvidos. */
export async function fetchSpaceMembers(spaceId: string): Promise<SpaceMembersResult> {
  const { data: memberRows, error } = await supabase
    .from("space_members")
    .select("profile_id, role, joined_at")
    .eq("space_id", spaceId)
    .order("joined_at", { ascending: true })

  if (error) return { members: [], error: error.message }
  if (!memberRows || memberRows.length === 0) return { members: [], error: null }

  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .in(
      "id",
      memberRows.map((row) => row.profile_id),
    )

  if (profilesError) return { members: [], error: profilesError.message }

  const profileById = new Map((profileRows ?? []).map((profile) => [profile.id, profile]))

  const members = memberRows.map((row): SpaceMember => {
    const profile = profileById.get(row.profile_id)
    return {
      profileId: row.profile_id,
      role: toMemberRole(row.role),
      joinedAt: row.joined_at,
      displayName: profile ? profileDisplayName(profile) : "Alguém",
      email: profile?.email ?? "",
    }
  })

  return { members, error: null }
}

/** Sair do espaço — só remove a própria membership (`space_members_delete_self`, ver `007_rls.sql`). */
export async function leaveSpace(spaceId: string, profileId: string): Promise<SpaceActionResult> {
  const { error } = await supabase
    .from("space_members")
    .delete()
    .eq("space_id", spaceId)
    .eq("profile_id", profileId)

  return { error: error?.message ?? null }
}

/**
 * Excluir o espaço é destrutivo e restrito ao dono (`spaces_delete_owner`).
 * `space_members`/`experiences`/`media` (linhas) têm `on delete cascade` a
 * partir de `spaces` — a única limpeza que o banco não faz sozinho são os
 * arquivos no Storage, por isso a busca+remoção acontece antes do delete.
 */
export async function deleteSpace(spaceId: string): Promise<SpaceActionResult> {
  const { media, error: mediaError } = await listMediaForSpace(spaceId)
  if (mediaError) return { error: mediaError.message }

  for (const item of media) {
    await deleteMedia(item)
  }

  const { error } = await supabase.from("spaces").delete().eq("id", spaceId)
  return { error: error?.message ?? null }
}

/** Chama a function security definer que valida e troca dono + role atomicamente (ver `014_space_management.sql`). */
export async function transferSpaceOwnership(
  spaceId: string,
  newOwnerId: string,
): Promise<SpaceActionResult> {
  const { error } = await supabase.rpc("transfer_space_ownership", {
    p_space_id: spaceId,
    p_new_owner_id: newOwnerId,
  })

  return { error: error?.message ?? null }
}
