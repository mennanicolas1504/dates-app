import * as React from "react"
import { useLocation } from "react-router-dom"

import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { SkeletonPhotoGrid } from "@/components/common/skeletons"
import { Typography } from "@/components/common/typography"
import { fetchMediaForMemories, fetchMemoriesForSpace } from "@/features/album/api"
import { AlbumToolbar } from "@/features/album/components/album-toolbar"
import { MemoryGrid } from "@/features/album/components/memory-grid"
import { MemoryViewer } from "@/features/album/components/memory-viewer"
import type { AlbumFilter, AlbumSort, Memory } from "@/features/album/types"
import { PageBackground } from "@/features/personalization/components/page-background"
import { toast } from "@/hooks/use-toast"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import type { MediaRecord } from "@/lib/media/types"
import { useAuth } from "@/providers/auth-provider"

export function AlbumPage() {
  const { space } = useAuth()
  const location = useLocation()

  const [memories, setMemories] = React.useState<Memory[]>([])
  const [mediaByMemoryId, setMediaByMemoryId] = React.useState<Map<string, MediaRecord[]>>(new Map())
  const [loading, setLoading] = React.useState(true)
  // Mesmo sentinel de 3 estados usado em `IdeiasPage`/`AuthProvider`: reseta
  // em render (não em efeito) sempre que o espaço muda de identidade.
  const [loadedSpaceId, setLoadedSpaceId] = React.useState<string | null | undefined>(undefined)

  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<AlbumFilter>("all")
  const [sort, setSort] = React.useState<AlbumSort>("recent")
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const spaceId = space?.id ?? null
  if (spaceId !== loadedSpaceId) {
    setLoadedSpaceId(spaceId)
    setLoading(spaceId !== null)
    setMemories([])
    setMediaByMemoryId(new Map())
  }

  React.useEffect(() => {
    if (!space) return

    let cancelled = false

    fetchMemoriesForSpace(space.id).then(async ({ memories: fetched, error }) => {
      if (cancelled) return
      if (error) {
        toast.error({ title: "Não foi possível carregar o álbum", description: error })
        setLoading(false)
        return
      }

      setMemories(fetched)
      setLoading(false)

      if (fetched.length > 0) {
        const { mediaByMemoryId: media } = await fetchMediaForMemories(fetched.map((memory) => memory.id))
        if (cancelled) return
        setMediaByMemoryId(media)
      }
    })

    return () => {
      cancelled = true
    }
  }, [space, spaceId])

  const coverMedia = React.useMemo(() => {
    const covers: MediaRecord[] = []
    for (const media of mediaByMemoryId.values()) {
      if (media[0]) covers.push(media[0])
    }
    return covers
  }, [mediaByMemoryId])
  const { urls: coverUrls } = useSignedMediaUrls(coverMedia)
  const thumbnailUrls = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const [memoryId, media] of mediaByMemoryId) {
      const url = media[0] && coverUrls.get(media[0].id)
      if (url) map.set(memoryId, url)
    }
    return map
  }, [mediaByMemoryId, coverUrls])

  const filteredMemories = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = memories.filter((memory) => {
      const matchesQuery =
        query.length === 0 ||
        memory.title.toLowerCase().includes(query) ||
        (memory.location?.toLowerCase().includes(query) ?? false) ||
        (memory.city?.toLowerCase().includes(query) ?? false)

      const photoCount = mediaByMemoryId.get(memory.id)?.length ?? 0
      const matchesFilter =
        filter === "all" ||
        (filter === "favorites" && memory.favorite) ||
        (filter === "withPhotos" && photoCount > 0) ||
        (filter === "rated" && Boolean(memory.rating))

      return matchesQuery && matchesFilter
    })

    return [...filtered].sort((a, b) => {
      const diff = new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      return sort === "recent" ? diff : -diff
    })
  }, [memories, search, filter, sort, mediaByMemoryId])

  // Deep link vindo da Home ("Última memória", ver `LastMemoryCard`): abre
  // direto a memória pedida assim que ela aparecer na lista filtrada. Mesmo
  // sentinel de render (não efeito) do resto do arquivo — só tenta uma vez
  // por id pedido, mesmo que o usuário troque de filtro depois.
  const requestedMemoryId = (location.state as { openMemoryId?: string } | null)?.openMemoryId ?? null
  const [consumedMemoryId, setConsumedMemoryId] = React.useState<string | null>(null)
  if (requestedMemoryId && requestedMemoryId !== consumedMemoryId && !loading) {
    const index = filteredMemories.findIndex((memory) => memory.id === requestedMemoryId)
    if (index !== -1) {
      setConsumedMemoryId(requestedMemoryId)
      setOpenIndex(index)
    }
  }

  const handleClearFilters = () => {
    setSearch("")
    setFilter("all")
  }

  const handleOpenMemory = (id: string) => {
    const index = filteredMemories.findIndex((memory) => memory.id === id)
    if (index !== -1) setOpenIndex(index)
  }

  if (!space) return null

  return (
    <>
      <PageBackground spaceId={space.id} />
      <PageContainer className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <PageTitle>Álbum</PageTitle>
        <Typography variant="subtitle">Suas memórias vividas, uma a uma.</Typography>
      </div>

      <AlbumToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {loading ? (
        <SkeletonPhotoGrid />
      ) : (
        <MemoryGrid
          memories={filteredMemories}
          hasAnyMemories={memories.length > 0}
          searchQuery={search}
          thumbnailUrls={thumbnailUrls}
          onOpenMemory={handleOpenMemory}
          onClearFilters={handleClearFilters}
        />
      )}

      <MemoryViewer
        memories={filteredMemories}
        mediaByMemoryId={mediaByMemoryId}
        index={openIndex}
        onIndexChange={setOpenIndex}
      />
      </PageContainer>
    </>
  )
}
