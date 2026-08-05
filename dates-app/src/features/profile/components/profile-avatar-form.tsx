import * as React from "react"
import { Camera, Loader2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { deleteMedia, uploadMedia } from "@/lib/media/api"
import { constraintsFor } from "@/lib/media/constraints"
import { validateFile } from "@/lib/media/validate"
import type { MediaRecord } from "@/lib/media/types"
import { cn } from "@/lib/utils"

interface ProfileAvatarFormProps {
  userId: string
  media: MediaRecord | null
  fallbackLabel: string
  onChanged: (media: MediaRecord | null) => void
}

/**
 * Avatar circular clicável — não a `MediaDropzone` (a caixa tracejada dela
 * é pensada para galerias de várias fotos; um avatar é sempre uma foto só,
 * substituída, nunca "adicionada" a uma lista). Ainda assim é 100% o
 * Sistema de Mídia por baixo: mesmo `uploadMedia`/`deleteMedia`, mesma
 * validação, mesmo bucket `avatars` (ver `lib/media/`) — só a affordance de
 * clique é própria daqui, porque nenhum componente existente cobre "trocar
 * uma imagem única em formato de avatar".
 */
export function ProfileAvatarForm({ userId, media, fallbackLabel, onChanged }: ProfileAvatarFormProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)

  const mediaArray = React.useMemo(() => (media ? [media] : []), [media])
  const { urls } = useSignedMediaUrls(mediaArray)
  const url = media ? urls.get(media.id) : undefined

  async function handleFile(file: File) {
    const validationError = validateFile(file, "user_avatar")
    if (validationError) {
      toast.error({ title: "Não foi possível usar esta imagem", description: validationError.message })
      return
    }

    setUploading(true)

    if (media) {
      await deleteMedia(media)
    }

    const { media: uploaded, error } = await uploadMedia({
      kind: "user_avatar",
      spaceId: null,
      resourceId: userId,
      createdById: userId,
      file,
    })

    setUploading(false)

    if (error || !uploaded) {
      toast.error({ title: "Não foi possível salvar a foto", description: error?.message })
      return
    }

    onChanged(uploaded)
    toast.success({ title: "Foto de perfil atualizada" })
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Alterar foto de perfil"
        className="group relative flex size-16 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Avatar size="lg" className="size-16">
          {url && <AvatarImage src={url} alt="" />}
          <AvatarFallback className="text-lg">{fallbackLabel}</AvatarFallback>
        </Avatar>

        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/40 group-hover:opacity-100",
            uploading && "bg-black/40 opacity-100",
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-white" strokeWidth={1.75} />
          ) : (
            <Camera className="size-5 text-white" strokeWidth={1.75} />
          )}
        </span>

        <input
          ref={inputRef}
          type="file"
          accept={constraintsFor("user_avatar").allowedMimeTypes.join(",")}
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (file) void handleFile(file)
          }}
          className="sr-only"
        />
      </button>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">Foto de perfil</span>
        <span className="text-xs text-muted-foreground">Clique na foto para trocar.</span>
      </div>
    </div>
  )
}
