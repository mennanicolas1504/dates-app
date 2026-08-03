import type { User } from "@supabase/supabase-js"

/**
 * O app pertence ao Espaço (o casal) — não ao usuário individual (ver
 * CLAUDE.md, "Filosofia", e UX_ARCHITECTURE.md).
 *
 * Ainda não existe uma tabela `spaces` no banco. Por enquanto o espaço vive
 * como metadata do próprio usuário no Supabase Auth (`user_metadata`) —
 * suficiente para um único dono, mas com uma limitação importante: metadata
 * é por usuário, então hoje é estruturalmente impossível dois usuários
 * diferentes compartilharem o mesmo espaço. Isso é exatamente o que a
 * próxima fase (Convites) precisa resolver, e exigirá uma tabela real:
 *
 *   spaces         (id uuid pk, name text, created_at timestamptz, owner_id uuid)
 *   space_members  (space_id uuid fk, user_id uuid fk, role text)
 *
 * `Space.id` já é um UUID estável hoje — vira o valor de `spaces.id` sem
 * precisar migrar dado nenhum. Quando essa tabela existir, só as funções
 * deste arquivo mudam (para consultar `space_members` em vez de
 * `user_metadata`) — o resto do app (AuthProvider, guards, Ideias, Header,
 * página de configurações) já consome só o contrato `Space` abaixo e não
 * precisa saber onde o dado realmente mora.
 */
export interface Space {
  id: string
  name: string
  /** ISO date string. */
  createdAt: string
  ownerId: string
}

interface SpaceUserMetadata {
  space_id?: string
  space_name?: string
  space_created_at?: string
  onboarding_completed?: boolean
}

export function getSpaceFromUser(user: User | null): Space | null {
  if (!user) return null

  const metadata = (user.user_metadata ?? {}) as SpaceUserMetadata
  if (!metadata.space_id || !metadata.space_name || !metadata.space_created_at) return null

  return {
    id: metadata.space_id,
    name: metadata.space_name,
    createdAt: metadata.space_created_at,
    ownerId: user.id,
  }
}

export function isOnboardingCompleted(user: User | null): boolean {
  const metadata = (user?.user_metadata ?? {}) as SpaceUserMetadata
  return Boolean(metadata.onboarding_completed)
}

/** Metadata gravada no usuário ao criar um espaço novo durante o onboarding. */
export function buildCreateSpaceMetadata(spaceName: string): SpaceUserMetadata {
  return {
    space_id: crypto.randomUUID(),
    space_name: spaceName,
    space_created_at: new Date().toISOString(),
    onboarding_completed: true,
  }
}
