import * as React from "react"
import { useNavigate } from "react-router-dom"

import { PageContainer } from "@/components/common/page-container"
import { SkeletonCard } from "@/components/common/skeletons"
import { isMemory } from "@/features/album/types"
import { FeaturedIdeaCard } from "@/features/home/components/featured-idea-card"
import { GreetingCard } from "@/features/home/components/greeting-card"
import { LastMemoryCard } from "@/features/home/components/last-memory-card"
import { NextExperienceCard } from "@/features/home/components/next-experience-card"
import { StatsCard } from "@/features/home/components/stats-card"
import { SuggestionCard } from "@/features/home/components/suggestion-card"
import {
  computeHomeStats,
  selectFeaturedIdea,
  selectNextExperience,
  selectRecentMemory,
  selectSuggestionIdea,
} from "@/features/home/select-highlights"
import { fetchExperiencesForSpace } from "@/features/ideias/api"
import type { Idea } from "@/features/ideias/types"
import { fetchProfile } from "@/features/profile/api"
import { toast } from "@/hooks/use-toast"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { listMedia } from "@/lib/media/api"
import type { MediaRecord } from "@/lib/media/types"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

/**
 * Painel do casal — tudo derivado de `fetchExperiencesForSpace` (a mesma
 * consulta que Ideias e Álbum já usam) mais o perfil/avatar do usuário.
 * Nenhuma consulta nova: cada card é só uma seleção diferente sobre a
 * mesma lista (ver `features/home/select-highlights.ts`).
 */
export function HomePage() {
  const { user, space } = useAuth()
  const navigate = useNavigate()

  const [experiences, setExperiences] = React.useState<Idea[]>([])
  const [displayName, setDisplayName] = React.useState<string>("")
  const [avatarMedia, setAvatarMedia] = React.useState<MediaRecord | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null)

  const key = user && space ? `${user.id}:${space.id}` : null
  if (key !== loadedKey) {
    setLoadedKey(key)
    setExperiences([])
    setAvatarMedia(null)
    setLoading(key !== null)
  }

  React.useEffect(() => {
    if (!user || !space) return

    let cancelled = false

    Promise.all([
      fetchExperiencesForSpace(space.id),
      fetchProfile(user.id),
      listMedia("user_avatar", user.id),
    ]).then(([experiencesResult, profileResult, avatarResult]) => {
      if (cancelled) return

      if (experiencesResult.error) {
        toast.error({ title: "Não foi possível carregar a Home", description: experiencesResult.error })
      }

      setExperiences(experiencesResult.experiences)
      setDisplayName(
        profileResult.profile?.displayName ?? user.email?.split("@")[0] ?? "você",
      )
      setAvatarMedia(avatarResult.media[0] ?? null)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user, space])

  const { urls: avatarUrls } = useSignedMediaUrls(avatarMedia ? [avatarMedia] : [])
  const avatarUrl = avatarMedia ? avatarUrls.get(avatarMedia.id) : undefined

  const memories = React.useMemo(() => experiences.filter(isMemory), [experiences])
  const nextExperience = React.useMemo(() => selectNextExperience(experiences), [experiences])
  const recentMemory = React.useMemo(() => selectRecentMemory(memories), [memories])
  const featuredIdea = React.useMemo(() => selectFeaturedIdea(experiences), [experiences])
  const suggestionIdea = React.useMemo(
    () => selectSuggestionIdea(experiences, featuredIdea?.id),
    [experiences, featuredIdea],
  )
  const stats = React.useMemo(() => computeHomeStats(experiences), [experiences])

  const [recentMemoryMedia, setRecentMemoryMedia] = React.useState<MediaRecord | null>(null)
  const [loadedMemoryId, setLoadedMemoryId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!recentMemory) return

    let cancelled = false

    listMedia("experience", recentMemory.id).then(({ media }) => {
      if (cancelled) return
      setRecentMemoryMedia(media[0] ?? null)
      setLoadedMemoryId(recentMemory.id)
    })

    return () => {
      cancelled = true
    }
  }, [recentMemory])

  const { urls: recentMemoryUrls } = useSignedMediaUrls(recentMemoryMedia ? [recentMemoryMedia] : [])
  const recentMemoryCoverUrl = recentMemoryMedia ? recentMemoryUrls.get(recentMemoryMedia.id) : undefined
  const recentMemoryReady = recentMemory && loadedMemoryId === recentMemory.id

  if (!space || !user) return null

  if (loading) {
    return (
      <PageContainer className="flex flex-col gap-5">
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-28" />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="flex flex-col gap-5">
      <GreetingCard
        displayName={displayName}
        spaceName={space.name}
        avatarUrl={avatarUrl}
        fallbackLabel={displayName.charAt(0).toUpperCase() || "?"}
        delayIndex={0}
      />

      <NextExperienceCard
        experience={nextExperience}
        onOpen={() => navigate(paths.ideias)}
        delayIndex={1}
      />

      <LastMemoryCard
        memory={recentMemory}
        coverUrl={recentMemoryReady ? recentMemoryCoverUrl : undefined}
        onOpen={() =>
          recentMemory && navigate(paths.album, { state: { openMemoryId: recentMemory.id } })
        }
        delayIndex={2}
      />

      <FeaturedIdeaCard
        idea={featuredIdea}
        onOpen={() => navigate(paths.ideias)}
        onCreate={() => navigate(paths.ideias)}
        delayIndex={3}
      />

      <StatsCard stats={stats} delayIndex={4} />

      <SuggestionCard idea={suggestionIdea} onOpen={() => navigate(paths.ideias)} delayIndex={5} />
    </PageContainer>
  )
}
