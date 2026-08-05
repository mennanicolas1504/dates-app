import type { Tables } from "@/types/database"

/**
 * Convite de uso único para entrar num espaço — nunca por código digitado,
 * sempre por link (ver CLAUDE.md, Fase 12). `token` é o segredo que vai na
 * URL compartilhada (`/convite/{token}`); o resto é só para exibição
 * (Configurações do Espaço mostra se o convite atual ainda está ativo).
 */
export interface SpaceInvite {
  id: string
  spaceId: string
  token: string
  createdById: string | null
  /** ISO date string. */
  createdAt: string
  /** ISO date string. */
  expiresAt: string
  /** ISO date string — `undefined` enquanto o convite não foi usado. */
  usedAt?: string
}

export function mapSpaceInviteRow(row: Tables<"space_invites">): SpaceInvite {
  return {
    id: row.id,
    spaceId: row.space_id,
    token: row.token,
    createdById: row.created_by_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    usedAt: row.used_at ?? undefined,
  }
}

export function isInviteActive(invite: SpaceInvite): boolean {
  return !invite.usedAt && new Date(invite.expiresAt).getTime() > Date.now()
}
