import * as React from "react"

import { getSignedUrl } from "@/lib/media/api"
import type { MediaRecord } from "@/lib/media/types"

const EMPTY_URLS = new Map<string, string>()

/**
 * Resolve signed URLs para uma lista de mídia persistida — os buckets são
 * privados (ver `011_media.sql`), então nunca existe uma URL pública pra
 * usar direto. Reaproveitável em qualquer lugar que precise exibir mídia
 * já salva, não só na grade de preview (`MediaPreviewGrid`).
 *
 * `getSignedUrl` já cacheia por `bucket+path` (ver `signed-url-cache.ts`),
 * então reprocessar a mesma lista em renders seguintes é barato mesmo sem
 * memoizar `media` no chamador.
 */
export function useSignedMediaUrls(media: MediaRecord[]) {
  const [urls, setUrls] = React.useState<Map<string, string>>(EMPTY_URLS)
  const [loading, setLoading] = React.useState(false)

  // Mesmo padrão de `AuthProvider`/`IdeiasPage`: reseta `loading` em render
  // (via comparação de assinatura), não com setState síncrono dentro do
  // efeito — o efeito só chama setState de dentro do `.then()` da Promise.
  const signature = media.map((item) => item.id).join(",")
  const [loadedSignature, setLoadedSignature] = React.useState<string | null>(null)
  if (signature !== loadedSignature) {
    setLoadedSignature(signature)
    setLoading(media.length > 0)
  }

  React.useEffect(() => {
    if (media.length === 0) return

    let cancelled = false

    Promise.all(
      media.map(async (item) => {
        const { url } = await getSignedUrl(item.storageBucket, item.storagePath)
        return [item.id, url] as const
      }),
    ).then((pairs) => {
      if (cancelled) return
      const next = new Map<string, string>()
      for (const [id, url] of pairs) {
        if (url) next.set(id, url)
      }
      setUrls(next)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [media])

  return { urls: media.length === 0 ? EMPTY_URLS : urls, loading: media.length === 0 ? false : loading }
}
