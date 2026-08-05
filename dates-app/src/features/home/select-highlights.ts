import { isMemory } from "@/features/album/types"
import type { Memory } from "@/features/album/types"
import type { Idea } from "@/features/ideias/types"

/**
 * Nenhuma consulta nova — a Home deriva tudo de uma única lista de
 * `Idea` já buscada (mesma `fetchExperiencesForSpace` que Ideias/Álbum já
 * usam). Cada função aqui é uma seleção simples e pura, fácil de trocar
 * por algo mais elaborado depois sem mexer nos componentes (ver
 * `SuggestionCard`, pensado para isso desde já).
 */

function byCreatedAtDesc(a: Idea, b: Idea): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

/** Próxima experiência planejada — a de `scheduledDate` mais próxima. */
export function selectNextExperience(experiences: Idea[]): Idea | undefined {
  return experiences
    .filter((experience) => experience.status === "scheduled" && experience.scheduledDate)
    .sort(
      (a, b) => new Date(a.scheduledDate as string).getTime() - new Date(b.scheduledDate as string).getTime(),
    )[0]
}

/** Memória mais recente — a de `completedAt` mais recente. */
export function selectRecentMemory(memories: Memory[]): Memory | undefined {
  return [...memories].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )[0]
}

/** Favorita primeiro, senão a mais recente, senão nenhuma. */
export function selectFeaturedIdea(experiences: Idea[]): Idea | undefined {
  const ideas = experiences.filter((experience) => experience.status === "idea")
  const favorite = ideas.filter((idea) => idea.favorite).sort(byCreatedAtDesc)[0]
  if (favorite) return favorite

  return [...ideas].sort(byCreatedAtDesc)[0]
}

/**
 * Sugestão simples: outra ideia ainda não planejada, diferente da já
 * destacada (evita repetir o mesmo card duas vezes na Home). Sem
 * algoritmo — só a próxima candidata mais recente (ver CLAUDE.md, Fase 16).
 */
export function selectSuggestionIdea(experiences: Idea[], excludeId?: string): Idea | undefined {
  const ideas = experiences.filter((experience) => experience.status === "idea" && experience.id !== excludeId)
  return [...ideas].sort(byCreatedAtDesc)[0]
}

export interface HomeStats {
  ideas: number
  planned: number
  memories: number
  favorites: number
}

export function computeHomeStats(experiences: Idea[]): HomeStats {
  return {
    ideas: experiences.filter((experience) => experience.status === "idea").length,
    planned: experiences.filter((experience) => experience.status === "scheduled").length,
    memories: experiences.filter(isMemory).length,
    favorites: experiences.filter((experience) => experience.favorite).length,
  }
}
