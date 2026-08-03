import type { Tables } from "@/types/database"

/**
 * O app pertence ao Espaço (o casal) — não ao usuário individual (ver
 * CLAUDE.md, "Filosofia", e UX_ARCHITECTURE.md).
 *
 * Backed por `spaces` + `space_members` (ver supabase/migrations/002 e 003)
 * — não mais por `user_metadata`. Um usuário pertence a um espaço quando
 * existe uma linha em `space_members` ligando `profile_id` a `space_id`;
 * essa linha é também o que define o onboarding como concluído (ver
 * `providers/auth-provider.tsx`).
 */
export interface Space {
  id: string
  name: string
  /** ISO date string. */
  createdAt: string
  ownerId: string
}

export function mapSpaceRow(row: Tables<"spaces">): Space {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    ownerId: row.owner_id,
  }
}
