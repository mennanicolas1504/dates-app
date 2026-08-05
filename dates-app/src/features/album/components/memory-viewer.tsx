import * as React from "react"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Wallet } from "lucide-react"

import { Gallery } from "@/components/common/gallery"
import { MediaSkeleton } from "@/components/common/media/media-skeleton"
import { Rating } from "@/components/common/rating"
import { Typography } from "@/components/common/typography"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { Memory } from "@/features/album/types"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { formatCurrency } from "@/lib/currency"
import { formatShortDateTime } from "@/lib/date"
import type { MediaRecord } from "@/lib/media/types"
import { transition } from "@/lib/motion"
import { resolveSwipeDirection } from "@/lib/swipe"

interface MemoryViewerProps {
  memories: Memory[]
  mediaByMemoryId: Map<string, MediaRecord[]>
  index: number | null
  onIndexChange: (index: number | null) => void
}

/**
 * Visualização em tela cheia de uma memória, com swipe para a próxima/
 * anterior — navega pela mesma lista filtrada/ordenada que está no grid
 * (ver `AlbumPage`), não por todas as memórias do espaço. As fotos de cada
 * memória usam a `Gallery` genérica sem nenhuma alteração: uma memória com
 * várias fotos vira uma grade dentro do painel, com o próprio zoom/swipe de
 * foto da Gallery — dois níveis de swipe (memória, depois foto), cada um
 * cuidado por quem já sabe cuidar dele.
 */
export function MemoryViewer({ memories, mediaByMemoryId, index, onIndexChange }: MemoryViewerProps) {
  const open = index !== null
  const memory = index !== null ? memories[index] : null
  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < memories.length - 1

  const currentMedia = React.useMemo(
    () => (memory ? (mediaByMemoryId.get(memory.id) ?? []) : []),
    [memory, mediaByMemoryId],
  )
  const { urls, loading } = useSignedMediaUrls(currentMedia)
  const galleryImages = currentMedia
    .map((item) => ({ src: urls.get(item.id), alt: memory?.title ?? "" }))
    .filter((image): image is { src: string; alt: string } => Boolean(image.src))

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (index === null) return
    const direction = resolveSwipeDirection(info.offset.x)
    if (direction === "next" && hasNext) onIndexChange(index + 1)
    else if (direction === "prev" && hasPrev) onIndexChange(index - 1)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onIndexChange(null)}>
      <DialogContent
        className="top-0 left-0 h-[100dvh] max-h-none w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none p-0 sm:top-1/2 sm:left-1/2 sm:h-[85vh] sm:max-h-[720px] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
        onKeyDown={(event) => {
          if (index === null) return
          if (event.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1)
          if (event.key === "ArrowRight" && hasNext) onIndexChange(index + 1)
        }}
      >
        <DialogTitle className="sr-only">{memory?.title ?? "Memória"}</DialogTitle>

        <div className="flex h-full flex-col overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {memory && (
              <motion.div
                key={memory.id}
                drag={memories.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                className="flex flex-1 touch-pan-y flex-col gap-4 overflow-y-auto p-4 select-none"
              >
                {loading ? (
                  <MediaSkeleton count={Math.max(currentMedia.length, 1)} />
                ) : (
                  galleryImages.length > 0 && <Gallery images={galleryImages} />
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <Typography variant="title">{memory.title}</Typography>
                    {memory.rating ? <Rating value={memory.rating} size="sm" /> : null}
                  </div>

                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 shrink-0" strokeWidth={1.75} />
                      {formatShortDateTime(new Date(memory.completedAt))}
                    </span>
                    {memory.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
                        {memory.location}
                      </span>
                    )}
                    {memory.actualCost !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Wallet className="size-3.5 shrink-0" strokeWidth={1.75} />
                        {formatCurrency(memory.actualCost)}
                      </span>
                    )}
                  </div>

                  {memory.notes && (
                    <div className="rounded-lg border-l-2 border-brand/40 bg-muted/40 px-3 py-2.5">
                      <Typography
                        variant="body"
                        className="text-pretty whitespace-pre-wrap text-foreground italic"
                      >
                        “{memory.notes}”
                      </Typography>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {memories.length > 1 && index !== null && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!hasPrev}
                onClick={() => onIndexChange(index - 1)}
                aria-label="Memória anterior"
              >
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </Button>
              <span className="text-xs text-muted-foreground">
                {index + 1} / {memories.length}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!hasNext}
                onClick={() => onIndexChange(index + 1)}
                aria-label="Próxima memória"
              >
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
