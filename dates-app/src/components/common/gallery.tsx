import * as React from "react"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { transition } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface GalleryImage {
  src: string
  alt: string
}

interface GalleryProps {
  images: GalleryImage[]
  emptyLabel?: string
  className?: string
}

export function Gallery({
  images,
  emptyLabel = "Nenhuma foto adicionada",
  className,
}: GalleryProps) {
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="size-6" strokeWidth={1.5} />
          <span className="text-xs">{emptyLabel}</span>
        </div>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPreviewIndex(0)}
          className={cn(
            "group block w-full overflow-hidden rounded-lg ring-1 ring-foreground/10",
            className,
          )}
        >
          <img
            src={images[0].src}
            alt={images[0].alt}
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </button>
        <GalleryPreview images={images} index={previewIndex} onIndexChange={setPreviewIndex} />
      </>
    )
  }

  return (
    <>
      <div className={cn("grid grid-cols-3 gap-2", className)}>
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            onClick={() => setPreviewIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-foreground/10"
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.05]"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/20 group-hover:opacity-100">
              <Eye className="size-4 text-white" strokeWidth={1.75} />
            </span>
          </button>
        ))}
      </div>
      <GalleryPreview images={images} index={previewIndex} onIndexChange={setPreviewIndex} />
    </>
  )
}

interface GalleryPreviewProps {
  images: GalleryImage[]
  index: number | null
  onIndexChange: (index: number | null) => void
}

const SWIPE_THRESHOLD = 60

/**
 * Visualização em tela cheia — troca de foto com swipe (arrastar
 * horizontalmente, via Framer Motion, mesma lib de animação já usada em
 * todo o app) ou pelos botões/setas do teclado. `AnimatePresence
 * mode="wait"` dá a transição suave entre fotos (nunca duas sobrepostas).
 */
function GalleryPreview({ images, index, onIndexChange }: GalleryPreviewProps) {
  const open = index !== null
  const image = index !== null ? images[index] : null
  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < images.length - 1

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (index === null) return
    if (info.offset.x < -SWIPE_THRESHOLD && hasNext) onIndexChange(index + 1)
    else if (info.offset.x > SWIPE_THRESHOLD && hasPrev) onIndexChange(index - 1)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onIndexChange(null)}>
      <DialogContent
        className="max-w-2xl gap-3 overflow-hidden p-2 sm:max-w-2xl"
        onKeyDown={(event) => {
          if (index === null) return
          if (event.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1)
          if (event.key === "ArrowRight" && hasNext) onIndexChange(index + 1)
        }}
      >
        <DialogTitle className="sr-only">{image?.alt || "Visualização da imagem"}</DialogTitle>

        <div className="relative max-h-[70vh] w-full overflow-hidden rounded-lg">
          <AnimatePresence mode="wait" initial={false}>
            {image && (
              <motion.img
                key={index}
                src={image.src}
                alt={image.alt}
                drag={images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                className="max-h-[70vh] w-full touch-pan-y object-contain select-none"
                draggable={false}
              />
            )}
          </AnimatePresence>
        </div>

        {images.length > 1 && index !== null && (
          <div className="flex items-center justify-between px-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!hasPrev}
              onClick={() => onIndexChange(index - 1)}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} />
            </Button>
            <span className="text-xs text-muted-foreground">
              {index + 1} / {images.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!hasNext}
              onClick={() => onIndexChange(index + 1)}
              aria-label="Próxima foto"
            >
              <ChevronRight className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
