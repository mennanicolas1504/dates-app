import { motion } from "framer-motion"

import { SearchEmpty } from "@/components/common/search-empty"
import { SectionTitle } from "@/components/common/section-title"
import { IdeaCard } from "@/features/ideias/components/idea-card"
import { IdeasEmptyState } from "@/features/ideias/components/ideas-empty-state"
import { fadeIn, transition } from "@/lib/motion"
import type { Idea, IdeaStatus } from "@/features/ideias/types"

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
  onPlan?: (id: string) => void
  onCancelPlan?: (id: string) => void
  onComplete?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  /** Ids com alguma ação assíncrona em voo (favoritar/planejar/excluir). */
  pendingIds?: ReadonlySet<string>
  /** Signed URL da primeira foto de cada ideia, já resolvida (ver `IdeiasPage`). */
  thumbnailUrls?: ReadonlyMap<string, string>
}

const GROUPS: { status: IdeaStatus; label: string }[] = [
  { status: "idea", label: "Ideias" },
  { status: "scheduled", label: "Planejadas" },
  { status: "completed", label: "Vividas" },
]

/**
 * Agrupada por estágio — Ideias, Planejadas, Vividas — em vez de uma lista
 * só misturando tudo (Fase 17: "separar visualmente Ideias e Planejadas").
 * A ordem/filtro de cada grupo continua vindo de `ideas` já pronta (ver
 * `IdeiasPage`); aqui só particiona por `status`, sem re-ordenar nada.
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
  onPlan,
  onCancelPlan,
  onComplete,
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

  // Índice global de cada ideia (atravessando os grupos), pra cascata de
  // entrada continuar suave mesmo com a lista agora dividida em seções —
  // calculado antes do render, não mutado durante ele (ver react-hooks/immutability).
  const indexById = new Map(
    GROUPS.flatMap(({ status }) => ideas.filter((idea) => idea.status === status)).map(
      (idea, index) => [idea.id, index] as const,
    ),
  )

  return (
    <div className="flex flex-col gap-5">
      {GROUPS.map(({ status, label }) => {
        const group = ideas.filter((idea) => idea.status === status)
        if (group.length === 0) return null

        return (
          <div key={status} className="flex flex-col gap-2">
            <SectionTitle as="h2" className="flex items-center gap-1.5 text-sm">
              {label}
              <span className="text-xs font-normal text-muted-foreground">{group.length}</span>
            </SectionTitle>

            <div className="flex flex-col gap-2">
              {group.map((idea) => {
                const delay = Math.min(indexById.get(idea.id) ?? 0, 12) * 0.02

                return (
                  <motion.div
                    key={idea.id}
                    initial="initial"
                    animate="animate"
                    variants={fadeIn}
                    transition={{ ...transition, delay }}
                  >
                    <IdeaCard
                      idea={idea}
                      onToggleFavorite={onToggleFavorite}
                      onOpenDetails={onOpenDetails}
                      onPlan={onPlan}
                      onCancelPlan={onCancelPlan}
                      onComplete={onComplete}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      pending={pendingIds?.has(idea.id)}
                      thumbnailUrl={thumbnailUrls?.get(idea.id)}
                    />
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
