import * as React from "react"

import { deleteMedia, uploadMedia } from "@/lib/media/api"
import { constraintsFor } from "@/lib/media/constraints"
import { validateFile } from "@/lib/media/validate"
import type { MediaKind, MediaRecord, MediaUploadItem } from "@/lib/media/types"

interface UseMediaUploadConfig {
  kind: MediaKind
  /** `null` só para `kind: "user_avatar"` (ver `types.ts`). */
  spaceId: string | null
  resourceId: string
  createdById: string
  /** Quantas mídias esse recurso já tem persistidas — para o limite de quantidade. */
  existingCount?: number
  onUploaded?: (media: MediaRecord) => void
  onDeleted?: (localId: string) => void
}

/**
 * Ponto único de integração para qualquer tela que precise de upload —
 * "toda futura tela deverá apenas consumir esta infraestrutura" (Fase 9.2).
 * Não sabe nada de Ideias/Experiências/Álbum: só orquestra o pipeline
 * (validar → subir → reportar) para a `kind` que o chamador passar.
 *
 * Progresso é grosseiro (0/50/100), não por byte: o método `upload()` do
 * SDK de Storage do Supabase não expõe progresso nativo — medir por byte
 * exigiria reimplementar o upload via XHR/fetch direto, perdendo o
 * retry/redirecionamento que o SDK já resolve. Fica como expansão futura
 * se a UX pedir uma barra mais precisa.
 */
export function useMediaUpload(config: UseMediaUploadConfig) {
  const [items, setItems] = React.useState<MediaUploadItem[]>([])
  const configRef = React.useRef(config)

  // Mantém a config mais recente disponível pros callbacks assíncronos
  // (`runUpload`) sem recriá-los a cada render — atualizar a ref precisa
  // acontecer fora do corpo de render (aqui, num efeito), nunca durante.
  React.useEffect(() => {
    configRef.current = config
  }, [config])

  // Libera os object URLs de preview ao desmontar — não fazer isso vaza
  // memória (URL.createObjectURL não é coletado sozinho pelo GC).
  React.useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só cleanup de unmount, não deve rerodar a cada mudança de `items`
  }, [])

  const runUpload = React.useCallback(async (item: MediaUploadItem) => {
    const { kind, spaceId, resourceId, createdById, onUploaded } = configRef.current

    setItems((prev) =>
      prev.map((i) => (i.localId === item.localId ? { ...i, status: "uploading", progress: 50 } : i)),
    )

    const { media, error } = await uploadMedia({
      kind,
      spaceId,
      resourceId,
      createdById,
      file: item.file,
    })

    if (media) {
      // Sucesso: some da fila em vez de ficar marcado "done" — quem chama
      // (`onUploaded`) passa a ser dono desse item pela lista de mídia já
      // persistida. Sem isso, o mesmo arquivo seria contado duas vezes no
      // limite de quantidade (uma aqui, outra na lista do chamador).
      setItems((prev) => prev.filter((i) => i.localId !== item.localId))
      onUploaded?.(media)
      return
    }

    setItems((prev) =>
      prev.map((i) => (i.localId === item.localId ? { ...i, status: "error", error, progress: 0 } : i)),
    )
  }, [])

  const addFiles = React.useCallback(
    (files: File[]) => {
      const { kind, existingCount = 0 } = configRef.current
      const constraints = constraintsFor(kind)

      const room =
        constraints.maxCount === null
          ? files.length
          : Math.max(0, constraints.maxCount - existingCount - items.length)
      const accepted = files.slice(0, room)

      const newItems: MediaUploadItem[] = accepted.map((file) => {
        const validationError = validateFile(file, kind)
        return {
          localId: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: validationError ? "error" : "pending",
          progress: 0,
          error: validationError,
          media: null,
        }
      })

      setItems((prev) => [...prev, ...newItems])
      newItems.filter((item) => item.status === "pending").forEach(runUpload)
    },
    [items.length, runUpload],
  )

  const retry = React.useCallback(
    (localId: string) => {
      const item = items.find((i) => i.localId === localId)
      if (item) runUpload(item)
    },
    [items, runUpload],
  )

  const remove = React.useCallback(
    async (localId: string) => {
      const item = items.find((i) => i.localId === localId)
      if (!item) return

      URL.revokeObjectURL(item.previewUrl)
      setItems((prev) => prev.filter((i) => i.localId !== localId))

      if (item.media) {
        await deleteMedia(item.media)
        configRef.current.onDeleted?.(localId)
      }
    },
    [items],
  )

  return { items, addFiles, retry, remove }
}
