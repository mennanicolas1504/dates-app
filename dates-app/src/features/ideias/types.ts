import type { DateBadgeStatus } from "@/components/common/date-badge"

/** Estados reais do ciclo de vida de uma Ideia (ver UX_ARCHITECTURE.md, Seção 2). */
export type IdeaStatus = Exclude<DateBadgeStatus, "favorite">

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
  /** 0 ou mais imagens — a primeira é usada como miniatura na lista. */
  images: string[]
  description?: string
  location?: string
  instagram?: string
  website?: string
  link?: string
  city?: string
  notes?: string
  /** ISO date string — presente quando status é "scheduled". */
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
  images: string[]
}
