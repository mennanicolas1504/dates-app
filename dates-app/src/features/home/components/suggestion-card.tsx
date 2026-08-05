import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

import { CategoryBadge } from "@/components/common/category-badge"
import { SectionTitle } from "@/components/common/section-title"
import { Card, CardContent } from "@/components/ui/card"
import type { Idea } from "@/features/ideias/types"
import { fadeIn, transition } from "@/lib/motion"

interface SuggestionCardProps {
  idea?: Idea
  onOpen: () => void
}

/**
 * Card 6 — reserva de espaço para sugestões. Nesta fase é só uma segunda
 * ideia ainda não planejada (ver `selectSuggestionIdea`), sem nenhum
 * algoritmo — a troca por uma sugestão de verdade no futuro é só trocar o
 * seletor que alimenta este componente, a interface dele já está pronta.
 */
export function SuggestionCard({ idea, onOpen }: SuggestionCardProps) {
  if (!idea) return null

  return (
    <motion.div initial="initial" animate="animate" variants={fadeIn} transition={transition} className="flex flex-col gap-2">
      <SectionTitle as="h2" className="flex items-center gap-1.5 text-sm">
        <Sparkles className="size-3.5 text-brand" strokeWidth={1.75} />
        Que tal planejar isso?
      </SectionTitle>

      <Card interactive onClick={onOpen} className="cursor-pointer">
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <CategoryBadge category={idea.category} className="w-fit" />
            <span className="truncate text-sm font-medium text-foreground">{idea.title}</span>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
