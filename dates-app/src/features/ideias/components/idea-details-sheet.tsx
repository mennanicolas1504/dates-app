import * as React from "react"

import { CategoryBadge } from "@/components/common/category-badge"
import { DateBadge } from "@/components/common/date-badge"
import { Gallery } from "@/components/common/gallery"
import { MediaSkeleton } from "@/components/common/media/media-skeleton"
import { Rating } from "@/components/common/rating"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Idea } from "@/features/ideias/types"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { formatShortDate, formatShortDateTime } from "@/lib/date"
import { listMedia } from "@/lib/media/api"
import type { MediaKind, MediaRecord } from "@/lib/media/types"

interface IdeaDetailsSheetProps {
  idea: Idea | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

/**
 * Painel lateral com todos os dados cadastrados de uma ideia — só os campos
 * que existem. Nada aqui é editável nesta fase, é leitura. As fotos usam a
 * `Gallery` genérica do Design System (zoom em tela cheia + swipe já
 * incluídos nela — ver `components/common/gallery.tsx`).
 *
 * Uma vez "vivida" (`status: "completed"`), a galeria some da fase Ideia
 * (`kind: "idea"`, fotos de inspiração) e passa a mostrar as fotos da
 * própria experiência (`kind: "experience"`, memórias reais) — coleções
 * deliberadamente separadas mesmo pertencendo ao mesmo registro (ver
 * `features/ideias/api.ts`, `completeExperience`).
 */
export function IdeaDetailsSheet({ idea, open, onOpenChange }: IdeaDetailsSheetProps) {
  const ideaId = idea?.id ?? null
  const isLived = idea?.status === "completed"
  const mediaKind: MediaKind = isLived ? "experience" : "idea"

  const [media, setMedia] = React.useState<MediaRecord[]>([])
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null)
  const [mediaLoading, setMediaLoading] = React.useState(false)

  // Mesmo padrão de `IdeiasPage`/`useSignedMediaUrls`: reseta em render
  // (via sentinel), não com setState síncrono dentro do efeito. A chave
  // inclui `mediaKind` porque a mesma ideia pode precisar recarregar a
  // galeria certa se o estágio mudar enquanto o painel está montado.
  const key = ideaId ? `${ideaId}:${mediaKind}` : null
  if (key !== loadedKey) {
    setLoadedKey(key)
    setMedia([])
    setMediaLoading(key !== null)
  }

  React.useEffect(() => {
    if (!ideaId) return

    let cancelled = false

    listMedia(mediaKind, ideaId).then(({ media: fetchedMedia }) => {
      if (cancelled) return
      setMedia(fetchedMedia)
      setMediaLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [ideaId, mediaKind])

  const { urls } = useSignedMediaUrls(media)
  const galleryImages = media
    .map((item) => ({ src: urls.get(item.id), alt: idea?.title ?? "" }))
    .filter((image): image is { src: string; alt: string } => Boolean(image.src))

  if (!idea) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="gap-2 border-b border-border px-4 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={idea.category} />
            <DateBadge status={idea.status} />
            {isLived && idea.rating && <Rating value={idea.rating} size="sm" />}
          </div>
          <SheetTitle className="text-lg">{idea.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes da ideia "{idea.title}"
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            {mediaLoading ? (
              <MediaSkeleton count={3} />
            ) : (
              media.length > 0 && <Gallery images={galleryImages} />
            )}

            {isLived ? (
              <>
                <DetailField
                  label="Vivida em"
                  value={idea.completedAt ? formatShortDateTime(new Date(idea.completedAt)) : undefined}
                />
                <DetailField label="Local" value={idea.location} />
                <DetailField label="Observações finais" value={idea.notes} />
                <DetailField
                  label="Custo real"
                  value={idea.actualCost !== undefined ? formatCurrency(idea.actualCost) : undefined}
                />
                {idea.scheduledDate && (
                  <DetailField
                    label="Planejamento original"
                    value={formatShortDateTime(new Date(idea.scheduledDate))}
                  />
                )}
                <DetailField label="Descrição" value={idea.description} />
              </>
            ) : (
              <>
                <DetailField label="Descrição" value={idea.description} />
                <DetailField
                  label="Planejada para"
                  value={
                    idea.scheduledDate ? formatShortDateTime(new Date(idea.scheduledDate)) : undefined
                  }
                />
                <DetailField label="Local" value={idea.location} />
                <DetailField label="Observações" value={idea.notes} />
              </>
            )}

            <DetailField label="Cidade" value={idea.city} />
            <DetailField label="Instagram" value={idea.instagram} />
            <DetailLink label="Website" href={idea.website} />
            <DetailLink label="Link" href={idea.link} />
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row items-center justify-between border-t border-border">
          <span className="text-xs text-muted-foreground">Por {idea.createdBy}</span>
          <span className="text-xs text-muted-foreground">
            {formatShortDate(new Date(idea.createdAt))}
          </span>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DetailField({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm whitespace-pre-wrap text-foreground">{value}</span>
    </div>
  )
}

function DetailLink({ label, href }: { label: string; href?: string }) {
  if (!href) return null

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-sm text-foreground underline underline-offset-2 hover:text-muted-foreground"
      >
        {href}
      </a>
    </div>
  )
}
