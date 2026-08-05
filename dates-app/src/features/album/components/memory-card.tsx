import { motion } from "framer-motion"
import { Image as ImageIcon, Star } from "lucide-react"

import { Rating } from "@/components/common/rating"
import type { Memory } from "@/features/album/types"
import { formatShortDate } from "@/lib/date"
import { DURATION, EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface MemoryCardProps {
  memory: Memory
  thumbnailUrl?: string
  onOpen: () => void
  className?: string
}

/**
 * Tile quadrado do grid — capa da memória com legenda em degradê por cima
 * (título + data), no espírito de um álbum de fotos moderno (Google/Apple
 * Photos). Memórias sem foto ainda entram no grid (Vivida não exige fotos),
 * só trocam a capa por um placeholder neutro.
 */
export function MemoryCard({ memory, thumbnailUrl, onOpen, className }: MemoryCardProps) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-muted text-left ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <ImageIcon className="size-6 text-muted-foreground/40" strokeWidth={1.5} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-80 transition-opacity duration-200 group-hover:opacity-95" />

      {memory.favorite && (
        <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/40 text-warning backdrop-blur-sm">
          <Star className="size-3.5 fill-current" strokeWidth={1.75} />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5">
        <span className="truncate text-sm font-medium text-white">{memory.title}</span>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] text-white/75">
            {formatShortDate(new Date(memory.completedAt))}
            {memory.location ? ` · ${memory.location}` : ""}
          </span>
          {memory.rating ? (
            <Rating value={memory.rating} size="sm" className="shrink-0 [&_svg]:size-2.5" />
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
