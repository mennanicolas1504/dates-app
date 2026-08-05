import { motion } from "framer-motion"
import { CalendarPlus, Clock, MapPin } from "lucide-react"

import { CategoryBadge } from "@/components/common/category-badge"
import { EmptyState } from "@/components/common/empty-state"
import { SectionTitle } from "@/components/common/section-title"
import { Card, CardContent } from "@/components/ui/card"
import type { Idea } from "@/features/ideias/types"
import { formatShortDate, formatShortTime } from "@/lib/date"
import { fadeIn, transition } from "@/lib/motion"

interface NextExperienceCardProps {
  experience?: Idea
  onOpen: () => void
  delayIndex?: number
}

/** Card 2 — próxima experiência planejada (a de `scheduledDate` mais próxima), ou convite para planejar uma. */
export function NextExperienceCard({ experience, onOpen, delayIndex = 0 }: NextExperienceCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={{ ...transition, delay: delayIndex * 0.06 }}
      className="flex flex-col gap-2"
    >
      <SectionTitle as="h2" className="text-sm">
        Próximo encontro
      </SectionTitle>

      {experience && experience.scheduledDate ? (
        <Card interactive onClick={onOpen} className="cursor-pointer">
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <CategoryBadge category={experience.category} />
            </div>
            <span className="text-base font-semibold text-foreground">{experience.title}</span>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" strokeWidth={1.75} />
                {formatShortDate(new Date(experience.scheduledDate))} às{" "}
                {formatShortTime(new Date(experience.scheduledDate))}
              </span>
              {experience.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
                  {experience.location}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={CalendarPlus}
          title="Nenhum encontro planejado"
          description="Escolha uma ideia e planeje o próximo encontro de vocês."
          action={{ label: "Planejar encontro", onClick: onOpen }}
          className="py-10"
        />
      )}
    </motion.div>
  )
}
