import { motion } from "framer-motion"
import { Images } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { SectionTitle } from "@/components/common/section-title"
import { Card, CardContent, CardImage } from "@/components/ui/card"
import type { Memory } from "@/features/album/types"
import { formatShortDate } from "@/lib/date"
import { fadeIn, transition } from "@/lib/motion"

interface LastMemoryCardProps {
  memory?: Memory
  coverUrl?: string
  onOpen: () => void
  delayIndex?: number
}

/** Card 3 — memória mais recente (a de `completedAt` mais recente). Toque abre o Álbum já na memória certa (ver `AlbumPage`). */
export function LastMemoryCard({ memory, coverUrl, onOpen, delayIndex = 0 }: LastMemoryCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={{ ...transition, delay: delayIndex * 0.06 }}
      className="flex flex-col gap-2"
    >
      <SectionTitle as="h2" className="text-sm">
        Última memória
      </SectionTitle>

      {memory ? (
        <Card interactive onClick={onOpen} className="cursor-pointer" size="sm">
          {coverUrl && <CardImage src={coverUrl} alt="" className="aspect-[16/9]" />}
          <CardContent className="flex flex-col gap-0.5">
            <span className="truncate text-base font-semibold text-foreground">{memory.title}</span>
            <span className="text-sm text-muted-foreground">
              {formatShortDate(new Date(memory.completedAt))}
            </span>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Images}
          title="Nenhuma memória ainda"
          description="Quando um encontro for vivido, ele aparece aqui."
          className="py-10"
        />
      )}
    </motion.div>
  )
}
