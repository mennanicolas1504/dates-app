import { AlertCircle, ArrowLeft, ArrowRight, ImageOff, Loader2, RotateCw, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { fadeIn, transition } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { MediaRecord, MediaUploadItem } from "@/lib/media/types"

interface MediaPreviewGridProps {
  /** Mídia já persistida, na ordem (`position`). */
  media: MediaRecord[]
  /** Itens em upload nesta sessão — aparecem depois da mídia persistida. */
  uploadItems?: MediaUploadItem[]
  onRemoveMedia?: (media: MediaRecord) => void
  onRemoveUploadItem?: (localId: string) => void
  onRetryUploadItem?: (localId: string) => void
  /** Omitir esconde os controles de reordenar — sem drag-and-drop de propósito (ver auditoria da Fase 9.2: sem dependência nova). */
  onReorder?: (updates: { id: string; position: number }[]) => void
  emptyLabel?: string
  className?: string
}

/**
 * Grade única para mídia já salva + uploads em andamento — o componente que
 * qualquer tela de mídia (Ideias, Experiências, Álbum...) vai renderizar.
 * Não sabe nada de domínio: só recebe `MediaRecord[]`/`MediaUploadItem[]` e
 * emite intenções (remover, tentar de novo, reordenar) pro chamador.
 */
export function MediaPreviewGrid({
  media,
  uploadItems = [],
  onRemoveMedia,
  onRemoveUploadItem,
  onRetryUploadItem,
  onReorder,
  emptyLabel = "Nenhuma mídia adicionada",
  className,
}: MediaPreviewGridProps) {
  const { urls } = useSignedMediaUrls(media)

  if (media.length === 0 && uploadItems.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="size-6" strokeWidth={1.5} />
          <span className="text-xs">{emptyLabel}</span>
        </div>
      </div>
    )
  }

  function moveMedia(index: number, direction: -1 | 1) {
    const target = index + direction
    if (!onReorder || target < 0 || target >= media.length) return

    const current = media[index]
    const swapWith = media[target]
    onReorder([
      { id: current.id, position: swapWith.position },
      { id: swapWith.id, position: current.position },
    ])
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", className)}>
      <AnimatePresence initial={false}>
        {media.map((item, index) => (
          <motion.div
            key={item.id}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={transition}
            className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-foreground/10"
          >
            {urls.has(item.id) ? (
              <img
                src={urls.get(item.id)}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full animate-pulse bg-muted" />
            )}

            <div className="absolute inset-0 flex flex-col justify-between bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/40 group-hover:opacity-100">
              <div className="flex justify-end p-1">
                {onRemoveMedia && (
                  <button
                    type="button"
                    onClick={() => onRemoveMedia(item)}
                    aria-label="Remover"
                    className="flex size-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="size-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>

              {onReorder && media.length > 1 && (
                <div className="flex justify-between p-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveMedia(index, -1)}
                    aria-label="Mover para a esquerda"
                    className="flex size-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    disabled={index === media.length - 1}
                    onClick={() => moveMedia(index, 1)}
                    aria-label="Mover para a direita"
                    className="flex size-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowRight className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {uploadItems.map((item) => (
          <motion.div
            key={item.localId}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={transition}
            className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-foreground/10"
          >
            <img src={item.previewUrl} alt="" className="size-full object-cover" />

            {item.status === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="size-5 animate-spin text-white" strokeWidth={2} />
              </div>
            )}

            {item.status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 p-2 text-center">
                <AlertCircle className="size-5 text-white" strokeWidth={1.75} />
                <span className="text-[10px] text-white">{item.error?.message}</span>
                <div className="flex items-center gap-1">
                  {onRetryUploadItem && (
                    <button
                      type="button"
                      onClick={() => onRetryUploadItem(item.localId)}
                      aria-label="Tentar de novo"
                      className="flex size-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                    >
                      <RotateCw className="size-3.5" strokeWidth={2} />
                    </button>
                  )}
                  {onRemoveUploadItem && (
                    <button
                      type="button"
                      onClick={() => onRemoveUploadItem(item.localId)}
                      aria-label="Remover"
                      className="flex size-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                    >
                      <X className="size-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {item.status !== "error" && onRemoveUploadItem && (
              <button
                type="button"
                onClick={() => onRemoveUploadItem(item.localId)}
                aria-label="Remover"
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
