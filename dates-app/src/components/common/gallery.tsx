import * as React from "react"
import { ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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

function GalleryPreview({ images, index, onIndexChange }: GalleryPreviewProps) {
  const open = index !== null
  const image = index !== null ? images[index] : null
  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && index < images.length - 1

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onIndexChange(null)}>
      <DialogContent className="max-w-2xl gap-3 p-2 sm:max-w-2xl">
        <DialogTitle className="sr-only">{image?.alt || "Visualização da imagem"}</DialogTitle>
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            className="max-h-[70vh] w-full rounded-lg object-contain"
          />
        )}
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
