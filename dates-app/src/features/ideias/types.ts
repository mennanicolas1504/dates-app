import type { DateBadgeStatus } from "@/components/common/date-badge"
import type { Tables } from "@/types/database"

/** Estados reais do ciclo de vida de uma Ideia (ver UX_ARCHITECTURE.md, Seção 2). */
export type IdeaStatus = Exclude<DateBadgeStatus, "favorite">

const IDEA_STATUSES: readonly IdeaStatus[] = ["idea", "scheduled", "completed"]

/**
 * `experiences.status` é `text` com `check` no banco, não um enum do
 * Postgres — o gerador de tipos não consegue restringir isso, então
 * chega como `string` puro. Estreita para `IdeaStatus` sem `any`,
 * caindo em "idea" só se o banco um dia tiver um valor fora do check
 * (nunca deveria acontecer, mas o tipo não pode assumir isso).
 */
function toIdeaStatus(value: string): IdeaStatus {
  return (IDEA_STATUSES as readonly string[]).includes(value) ? (value as IdeaStatus) : "idea"
}

export interface Idea {
  id: string
  /** Espaço ao qual a ideia pertence — nunca ao usuário que a criou (ver CLAUDE.md, "Filosofia"). */
  spaceId: string
  title: string
  category: string
  status: IdeaStatus
  favorite: boolean
  createdBy: string
  /** ISO date string. */
  createdAt: string
  description?: string
  location?: string
  instagram?: string
  website?: string
  link?: string
  city?: string
  notes?: string
  /** ISO date string — presente quando status é "scheduled" ou "completed". */
  scheduledDate?: string
}

/**
 * Valores do formulário "Nova ideia". Só `title` e `category` são
 * obrigatórios (validado no próprio diálogo) — todo o resto existe para
 * quem quiser detalhar, nunca é exigido.
 */
export interface NewIdeaFormValues {
  title: string
  category: string
  description: string
  location: string
  instagram: string
  website: string
  link: string
  city: string
  notes: string
}

/** `createdByName` vem de uma consulta separada em `profiles` — ver `features/ideias/api.ts`. */
export function mapExperienceRow(row: Tables<"experiences">, createdByName: string): Idea {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    category: row.category,
    status: toIdeaStatus(row.status),
    favorite: row.favorite,
    createdBy: createdByName,
    createdAt: row.created_at,
    description: row.description ?? undefined,
    location: row.location ?? undefined,
    instagram: row.instagram ?? undefined,
    website: row.website ?? undefined,
    link: row.link ?? undefined,
    city: row.city ?? undefined,
    notes: row.notes ?? undefined,
    scheduledDate: row.scheduled_date ?? undefined,
  }
}
