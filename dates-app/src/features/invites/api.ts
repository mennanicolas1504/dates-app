import { mapSpaceInviteRow } from "@/features/invites/types"
import type { SpaceInvite } from "@/features/invites/types"
import { supabase } from "@/lib/supabase"

interface SpaceInviteResult {
  invite: SpaceInvite | null
  error: string | null
}

interface RedeemInviteResult {
  spaceId: string | null
  error: string | null
}

async function findActiveInvites(spaceId: string): Promise<SpaceInviteResult & { invites: SpaceInvite[] }> {
  const { data, error } = await supabase
    .from("space_invites")
    .select("*")
    .eq("space_id", spaceId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) return { invite: null, invites: [], error: error.message }
  const invites = (data ?? []).map(mapSpaceInviteRow)
  return { invite: invites[0] ?? null, invites, error: null }
}

async function createSpaceInvite(spaceId: string, createdById: string): Promise<SpaceInviteResult> {
  const { data, error } = await supabase
    .from("space_invites")
    .insert({ space_id: spaceId, created_by_id: createdById })
    .select()
    .single()

  if (error || !data) {
    return { invite: null, error: error?.message ?? "Não foi possível gerar o convite." }
  }

  return { invite: mapSpaceInviteRow(data), error: null }
}

/**
 * O link de convite é sempre "o convite ativo mais recente do espaço", não
 * um por chamador — reaproveitado tanto na criação do espaço (onboarding)
 * quanto em Configurações do Espaço (ver `InviteLinkCard`), sem duplicar
 * lógica. Só gera um novo se não existir nenhum ativo (nunca criado, ou o
 * último expirou/foi usado).
 */
export async function getOrCreateActiveInvite(
  spaceId: string,
  createdById: string,
): Promise<SpaceInviteResult> {
  const { invite: existing, error: findError } = await findActiveInvites(spaceId)
  if (findError) return { invite: null, error: findError }
  if (existing) return { invite: existing, error: null }

  return createSpaceInvite(spaceId, createdById)
}

/**
 * "Gerar novo convite" (Configurações do Espaço) — revoga todo convite
 * ativo do espaço (marca `expires_at` no passado, mesma checagem que
 * `redeem_space_invite` já usa para recusar convite expirado — nenhuma
 * coluna nova precisa existir só para "revogado") e cria um novo. Link
 * antigo compartilhado antes some de circulação sem exigir que alguém o
 * tenha usado.
 */
export async function regenerateSpaceInvite(
  spaceId: string,
  createdById: string,
): Promise<SpaceInviteResult> {
  const { invites: active, error: findError } = await findActiveInvites(spaceId)
  if (findError) return { invite: null, error: findError }

  if (active.length > 0) {
    const { error: revokeError } = await supabase
      .from("space_invites")
      .update({ expires_at: new Date().toISOString() })
      .in(
        "id",
        active.map((invite) => invite.id),
      )

    if (revokeError) return { invite: null, error: revokeError.message }
  }

  return createSpaceInvite(spaceId, createdById)
}

/**
 * Único ponto de entrada num espaço por convite — chama
 * `redeem_space_invite` (security definer, ver `013_space_invites.sql`),
 * que valida o token, checa uso único/expiração/limite de membros, insere
 * `space_members` e marca o convite como usado, tudo numa transação. O
 * client nunca lê `space_invites` diretamente para validar nada.
 */
export async function redeemSpaceInvite(token: string): Promise<RedeemInviteResult> {
  const { data, error } = await supabase.rpc("redeem_space_invite", { p_token: token })

  if (error) return { spaceId: null, error: error.message }
  return { spaceId: data, error: null }
}
