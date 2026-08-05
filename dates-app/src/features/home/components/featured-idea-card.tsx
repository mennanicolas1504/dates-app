import { motion } from "framer-motion"
import { Lightbulb, Star } from "lucide-react"

import { CategoryBadge } from "@/components/common/category-badge"
import { EmptyState } from "@/components/common/empty-state"
import { SectionTitle } from "@/components/common/section-title"
import { Card, CardContent } from "@/components/ui/card"
import type { Idea } from "@/features/ideias/types"
import { fadeIn, transition } from "@/lib/motion"

interface FeaturedIdeaCardProps {
  idea?: Idea
  onOpen: () => void
  onCreate: () => void
}

/** Card 4 — uma ideia em destaque: favorita primeiro, senão a mais recente (ver `selectFeaturedIdea`). */
export function FeaturedIdeaCard({ idea, onOpen, onCreate }: FeaturedIdeaCardProps) {
  return (
    <motion.div initial="initial" animate="animate" variants={fadeIn} transition={transition} className="flex flex-col gap-2">
      <SectionTitle as="h2" className="text-sm">
        Ideia em destaque
      </SectionTitle>

      {idea ? (
        <Card interactive onClick={onOpen} className="cursor-pointer">
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <CategoryBadge category={idea.category} />
              {idea.favorite && <Star className="size-4 fill-warning text-warning" strokeWidth={1.75} />}
            </div>
            <span className="text-base font-semibold text-foreground">{idea.title}</span>
            {idea.description && (
              <span className="line-clamp-2 text-sm text-muted-foreground">{idea.description}</span>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="Nenhuma ideia ainda"
          description="Capture a primeira ideia de encontro do casal."
          action={{ label: "Criar ideia", onClick: onCreate }}
          className="py-10"
        />
      )}
    </motion.div>
  )
}
