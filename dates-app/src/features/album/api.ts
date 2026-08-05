import { fetchExperiencesForSpace } from "@/features/ideias/api"
import { isMemory } from "@/features/album/types"
import type { Memory } from "@/features/album/types"
import { listMediaForResources } from "@/lib/media/api"
import type { MediaRecord } from "@/lib/media/types"

interface MemoriesResult {
  memories: Memory[]
  error: string | null
}

interface MemoriesMediaResult {
  mediaByMemoryId: Map<string, MediaRecord[]>
  error: string | null
}

/**
 * Não existe uma tabela `memories` — o Álbum é só uma leitura de
 * `experiences` filtrada para o estágio "Vivida" (ver `features/album/types.ts`).
 * Reaproveita a mesma consulta que a tela de Ideias já usa; nenhuma query
 * nova precisa existir só para o Álbum.
 */
export async function fetchMemoriesForSpace(spaceId: string): Promise<MemoriesResult> {
  const { experiences, error } = await fetchExperiencesForSpace(spaceId)
  if (error) return { memories: [], error }

  return { memories: experiences.filter(isMemory), error: null }
}

/**
 * Fotos de memória são `media` com `kind: "experience"` — mesma coleção que
 * a fase Vivida das Ideias já usa (ver `CompleteExperienceDialog`). Devolve
 * tudo (não só a capa) já agrupado por memória, porque o Álbum precisa da
 * contagem completa para o filtro "com fotos" e do conjunto inteiro para o
 * visualizador em tela cheia.
 */
export async function fetchMediaForMemories(memoryIds: string[]): Promise<MemoriesMediaResult> {
  const { media, error } = await listMediaForResources("experience", memoryIds)
  if (error) return { mediaByMemoryId: new Map(), error: error.message }

  const mediaByMemoryId = new Map<string, MediaRecord[]>()
  for (const item of media) {
    const existing = mediaByMemoryId.get(item.resourceId)
    if (existing) existing.push(item)
    else mediaByMemoryId.set(item.resourceId, [item])
  }

  return { mediaByMemoryId, error: null }
}
