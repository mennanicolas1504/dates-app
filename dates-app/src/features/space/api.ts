import { mapSpaceRow } from "@/features/space/types"
import type { Space } from "@/features/space/types"
import { supabase } from "@/lib/supabase"

interface SpaceResult {
  space: Space | null
  error: string | null
}

interface SpaceActionResult {
  error: string | null
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
