import * as React from "react"

import { thumbnailKindFor } from "@/features/notifications/thumbnails"
import type { NotificationRecord } from "@/features/notifications/types"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { listMediaForResources } from "@/lib/media/api"
import type { MediaKind, MediaRecord } from "@/lib/media/types"

const EMPTY_URLS = new Map<string, string>()

/**
 * Miniatura por notificação — mesmo padrão de lote de `IdeiasPage`
 * (`thumbnailUrls`): agrupa por `MediaKind`, busca cada grupo de uma vez
 * (`listMediaForResources`), pega a primeira mídia de cada recurso e só
 * então resolve as signed URLs (`useSignedMediaUrls`, já cacheada por
 * bucket+path). Uma notificação sem `resourceId`/`resourceKind`
 * resolvível (ex: convite gerado, entrada/saída de membro) simplesmente
 * não aparece no mapa devolvido — quem consome cai no ícone do tipo.
 */
export function useNotificationThumbnails(notifications: NotificationRecord[]) {
  const [mediaByNotificationId, setMediaByNotificationId] = React.useState<Map<string, MediaRecord>>(
    new Map(),
  )

  // Mesmo sentinel de render (não setState dentro do efeito) usado em
  // `AlbumPage`/`IdeiasPage`: zera assim que a lista muda de identidade,
  // antes do efeito buscar a mídia de verdade.
  const signature = notifications.map((item) => item.id).join(",")
  const [loadedSignature, setLoadedSignature] = React.useState<string | null>(null)
  if (signature !== loadedSignature) {
    setLoadedSignature(signature)
    setMediaByNotificationId(new Map())
  }

  React.useEffect(() => {
    if (notifications.length === 0) return

    let cancelled = false

    const byKind = new Map<MediaKind, { notificationId: string; resourceId: string }[]>()
    for (const notification of notifications) {
      const kind = thumbnailKindFor(notification)
      if (!kind || !notification.resourceId) continue
      const entries = byKind.get(kind) ?? []
      entries.push({ notificationId: notification.id, resourceId: notification.resourceId })
      byKind.set(kind, entries)
    }

    Promise.all(
      Array.from(byKind.entries()).map(async ([kind, entries]) => {
        const { media } = await listMediaForResources(
          kind,
          entries.map((entry) => entry.resourceId),
        )
        return { entries, media }
      }),
    ).then((results) => {
      if (cancelled) return

      const next = new Map<string, MediaRecord>()
      for (const { entries, media } of results) {
        const firstByResource = new Map<string, MediaRecord>()
        for (const item of media) {
          if (!firstByResource.has(item.resourceId)) firstByResource.set(item.resourceId, item)
        }
        for (const entry of entries) {
          const item = firstByResource.get(entry.resourceId)
          if (item) next.set(entry.notificationId, item)
        }
      }
      setMediaByNotificationId(next)
    })

    return () => {
      cancelled = true
    }
  }, [notifications])

  const mediaList = React.useMemo(() => Array.from(mediaByNotificationId.values()), [mediaByNotificationId])
  const { urls } = useSignedMediaUrls(mediaList)

  return React.useMemo(() => {
    if (mediaByNotificationId.size === 0) return EMPTY_URLS

    const result = new Map<string, string>()
    for (const [notificationId, media] of mediaByNotificationId) {
      const url = urls.get(media.id)
      if (url) result.set(notificationId, url)
    }
    return result
  }, [mediaByNotificationId, urls])
}
