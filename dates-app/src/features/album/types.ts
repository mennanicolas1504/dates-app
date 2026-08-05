import type { Idea } from "@/features/ideias/types"

/**
 * O Álbum não tem entidade própria — uma Memória é só uma Ideia cujo status
 * já é "completed" (Vivida), com `completedAt` sempre presente (por isso o
 * único ajuste de tipo é tornar esse campo obrigatório; todo o resto vem
 * exatamente de `Idea`, ver `features/ideias/types.ts`). Nenhum dado novo,
 * nenhuma tabela nova — ver `features/album/api.ts`.
 */
export type Memory = Idea & { completedAt: string }

export function isMemory(idea: Idea): idea is Memory {
  return idea.status === "completed" && Boolean(idea.completedAt)
}

export type AlbumFilter = "all" | "favorites" | "withPhotos" | "rated"

export type AlbumSort = "recent" | "oldest"
