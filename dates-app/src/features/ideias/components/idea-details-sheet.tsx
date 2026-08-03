import { CategoryBadge } from "@/components/common/category-badge"
import { DateBadge } from "@/components/common/date-badge"
import { Gallery } from "@/components/common/gallery"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatShortDate } from "@/lib/date"
import type { Idea } from "@/features/ideias/types"

interface IdeaDetailsSheetProps {
  idea: Idea | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Painel lateral com todos os dados cadastrados de uma ideia — só os campos
 * que existem. Nada aqui é editável nesta fase, é leitura (ver o pedido:
 * "exibir exatamente os dados cadastrados no modal Nova ideia").
 */
export function IdeaDetailsSheet({ idea, open, onOpenChange }: IdeaDetailsSheetProps) {
  if (!idea) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="gap-2 border-b border-border px-4 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={idea.category} />
            <DateBadge status={idea.status} />
          </div>
          <SheetTitle className="text-lg">{idea.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes da ideia "{idea.title}"
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            <DetailField label="Descrição" value={idea.description} />
            <DetailField
              label="Data agendada"
              value={idea.scheduledDate ? formatShortDate(new Date(idea.scheduledDate)) : undefined}
            />

            {idea.images.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Imagens</span>
                <Gallery
                  images={idea.images.map((src) => ({ src, alt: idea.title }))}
                />
              </div>
            )}

            <DetailField label="Local" value={idea.location} />
            <DetailField label="Cidade" value={idea.city} />
            <DetailField label="Instagram" value={idea.instagram} />
            <DetailLink label="Website" href={idea.website} />
            <DetailLink label="Link" href={idea.link} />
            <DetailField label="Observações" value={idea.notes} />
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
