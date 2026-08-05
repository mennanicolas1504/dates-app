import * as React from "react"
import { motion } from "framer-motion"

import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { listMedia } from "@/lib/media/api"
import type { MediaRecord } from "@/lib/media/types"
import { fadeIn, transition } from "@/lib/motion"

interface PageBackgroundProps {
  spaceId: string
}

/**
 * Camada de fundo personalizado (`kind: "app_background"`) — fixa,
 * atrás de tudo, com leve blur e escurecimento pra nunca competir com o
 * conteúdo por cima (Fase 18, Seção 7: "as imagens devem complementar a
 * interface"). Some sozinha se o espaço não tiver um fundo definido (mesmo
 * fundo neutro de sempre) — cada página que a usa só precisa montá-la,
 * ela busca e resolve a própria imagem.
 *
 * De propósito só em Home/Perfil/Memórias (ver essas páginas) — não em
 * Ideias ou telas de formulário, que ficam sólidas por legibilidade
 * (Fase 18, Seção 2).
 */
export function PageBackground({ spaceId }: PageBackgroundProps) {
  const [media, setMedia] = React.useState<MediaRecord | null>(null)
  const [loadedSpaceId, setLoadedSpaceId] = React.useState<string | null>(null)

  if (spaceId !== loadedSpaceId) {
    setLoadedSpaceId(spaceId)
    setMedia(null)
  }

  React.useEffect(() => {
    let cancelled = false

    listMedia("app_background", spaceId).then(({ media: fetched }) => {
      if (cancelled) return
      setMedia(fetched[0] ?? null)
    })

    return () => {
      cancelled = true
    }
  }, [spaceId])

  const { urls } = useSignedMediaUrls(media ? [media] : [])
  const url = media ? urls.get(media.id) : undefined

  if (!url) return null

  return (
    <motion.div
      aria-hidden="true"
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={transition}
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      <img src={url} alt="" className="size-full scale-110 object-cover blur-md" />
      <div className="absolute inset-0 bg-background/70" />
    </motion.div>
  )
}
