import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Camera, Loader2, Trash2, type LucideIcon } from "lucide-react"

import { Gallery } from "@/components/common/gallery"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { deleteMedia, uploadMedia } from "@/lib/media/api"
import { constraintsFor } from "@/lib/media/constraints"
import { validateFile } from "@/lib/media/validate"
import type { MediaKind, MediaRecord } from "@/lib/media/types"
import { fadeIn, transition } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface PersonalizationSlotProps {
  kind: MediaKind
  /** `null` só para mídia de escopo do usuário — nenhuma das kinds desta tela é (ver `lib/media/types.ts`). */
  spaceId: string
  resourceId: string
  createdById: string
  media: MediaRecord | null
  onChanged: (media: MediaRecord | null) => void
  label: string
  description?: string
  emptyIcon: LucideIcon
  className?: string
}

/**
 * Um "slot" de imagem única (troca, nunca acumula — toda `kind` usada aqui
 * tem `maxCount: 1`, ver `constraints.ts`): foto do casal, plano de fundo,
 * capa do espaço. Mesmo par `uploadMedia`/`deleteMedia` que qualquer outra
 * tela de mídia já usa — trocar é apagar o antigo e subir o novo (a mesma
 * regra que `ProfileAvatarForm` já segue para o avatar individual); a
 * visualização em tela cheia é a `Gallery` genérica, sem modificação.
 */
export function PersonalizationSlot({
  kind,
  spaceId,
  resourceId,
  createdById,
  media,
  onChanged,
  label,
  description,
  emptyIcon: EmptyIcon,
  className,
}: PersonalizationSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)

  const { urls } = useSignedMediaUrls(media ? [media] : [])
  const url = media ? urls.get(media.id) : undefined

  function openPicker() {
    if (!uploading && !removing) inputRef.current?.click()
  }

  async function handleFile(file: File) {
    const validationError = validateFile(file, kind)
    if (validationError) {
      toast.error({ title: "Não foi possível usar esta imagem", description: validationError.message })
      return
    }

    setUploading(true)

    if (media) {
      await deleteMedia(media)
    }

    const { media: uploaded, error } = await uploadMedia({
      kind,
      spaceId,
      resourceId,
      createdById,
      file,
    })

    setUploading(false)

    if (error || !uploaded) {
      toast.error({ title: "Não foi possível salvar a imagem", description: error?.message })
      return
    }

    onChanged(uploaded)
    toast.success({ title: `${label} atualizada` })
  }

  async function handleRemove(event: React.MouseEvent) {
    event.stopPropagation()
    if (!media) return

    setRemoving(true)
    await deleteMedia(media)
    setRemoving(false)

    onChanged(null)
    toast.success({ title: `${label} removida` })
  }

  const state = uploading ? "uploading" : media && url ? "filled" : "empty"

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {state === "uploading" && (
          <motion.div key="uploading" initial="initial" animate="animate" exit="exit" variants={fadeIn} transition={transition}>
            <Skeleton className="aspect-video w-full rounded-lg" />
          </motion.div>
        )}

        {state === "filled" && (
          <motion.div
            key="filled"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={transition}
            className="relative"
          >
            <Gallery images={[{ src: url as string, alt: label }]} />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  openPicker()
                }}
                aria-label={`Trocar ${label.toLowerCase()}`}
                className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                <Camera className="size-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                aria-label={`Remover ${label.toLowerCase()}`}
                className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:pointer-events-none disabled:opacity-50"
              >
                {removing ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {state === "empty" && (
          <motion.button
            key="empty"
            type="button"
            onClick={openPicker}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={transition}
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <EmptyIcon className="size-6" strokeWidth={1.5} />
            <span className="text-xs">Adicionar {label.toLowerCase()}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={constraintsFor(kind).allowedMimeTypes.join(",")}
        disabled={uploading || removing}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) void handleFile(file)
        }}
        className="sr-only"
      />
    </div>
  )
}
