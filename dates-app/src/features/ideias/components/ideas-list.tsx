import { motion } from "framer-motion"

import { SearchEmpty } from "@/components/common/search-empty"
import { IdeaCard } from "@/features/ideias/components/idea-card"
import { IdeasEmptyState } from "@/features/ideias/components/ideas-empty-state"
import { fadeIn, transition } from "@/lib/motion"
import type { Idea } from "@/features/ideias/types"

interface IdeasListProps {
  /** Ideias já filtradas/ordenadas, prontas para exibição. */
  ideas: Idea[]
  /** Se existe pelo menos uma ideia cadastrada, antes de qualquer filtro. */
  hasAnyIdeas: boolean
  searchQuery?: string
  onClearFilters?: () => void
  onCreateFirst?: () => void
  onOpenSuggestions?: () => void
  onToggleFavorite?: (id: string) => void
  onOpenDetails?: (id: string) => void
  onSchedule?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  /** Ids com alguma ação assíncrona em voo (favoritar/agendar/excluir). */
  pendingIds?: ReadonlySet<string>
  /** Signed URL da primeira foto de cada ideia, já resolvida (ver `IdeiasPage`). */
  thumbnailUrls?: ReadonlyMap<string, string>
}

/**
 * Lista vertical densa — não um grid de cards. Cada linha é curta o
 * suficiente para dezenas de ideias caberem sem grande scroll.
 */
export function IdeasList({
  ideas,
  hasAnyIdeas,
  searchQuery,
  onClearFilters,
  onCreateFirst,
  onOpenSuggestions,
  onToggleFavorite,
  onOpenDetails,
  onSchedule,
  onEdit,
  onDelete,
  pendingIds,
  thumbnailUrls,
}: IdeasListProps) {
  if (!hasAnyIdeas) {
    return (
      <IdeasEmptyState
        onCreate={() => onCreateFirst?.()}
        onSuggestions={() => onOpenSuggestions?.()}
      />
    )
  }

  if (ideas.length === 0) {
    return <SearchEmpty query={searchQuery} onClear={onClearFilters} />
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {ideas.map((idea, index) => (
        <motion.div
          key={idea.id}
          initial="initial"
          animate="animate"
          variants={fadeIn}
          transition={{ ...transition, delay: Math.min(index, 12) * 0.02 }}
        >
          <IdeaCard
            idea={idea}
            onToggleFavorite={onToggleFavorite}
            onOpenDetails={onOpenDetails}
            onSchedule={onSchedule}
            onEdit={onEdit}
            onDelete={onDelete}
            pending={pendingIds?.has(idea.id)}
            thumbnailUrl={thumbnailUrls?.get(idea.id)}
          />
        </motion.div>
      ))}
    </div>
  )
}
