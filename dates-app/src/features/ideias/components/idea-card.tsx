import { motion } from "framer-motion"
import { CalendarPlus, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react"

import { CategoryBadge } from "@/components/common/category-badge"
import { DateBadge } from "@/components/common/date-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatShortDate } from "@/lib/date"
import { DURATION } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { Idea } from "@/features/ideias/types"

interface IdeaCardProps {
  idea: Idea
  onToggleFavorite?: (id: string) => void
  onOpenDetails?: (id: string) => void
  onSchedule?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

/**
 * Linha compacta de ideia — não um card de catálogo. Em repouso mostra só o
 * essencial (título, categoria, quem/quando); estado "Ideia" (o padrão) não
 * ganha badge própria, só desvios dele (Agendada/Concluída). Favorito só
 * aparece sempre quando já é favorito — senão só ao passar o mouse — para
 * não poluir a maioria das linhas com um ícone vazio. Ver UX_ARCHITECTURE.md.
 */
export function IdeaCard({
  idea,
  onToggleFavorite,
  onOpenDetails,
  onSchedule,
  onEdit,
  onDelete,
  className,
}: IdeaCardProps) {
  const meta = [
    idea.status === "scheduled" && idea.scheduledDate
      ? `Agendada p/ ${formatShortDate(new Date(idea.scheduledDate))}`
      : null,
    idea.notes,
    `Por ${idea.createdBy}`,
    formatShortDate(new Date(idea.createdAt)),
  ]
    .filter(Boolean)
    .join(" · ")
  const thumbnail = idea.images[0]

  return (
    <div
      className={cn(
        "group/row flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpenDetails?.(idea.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className="size-9 shrink-0 rounded-md object-cover ring-1 ring-foreground/10"
          />
        ) : (
          <div className="size-9 shrink-0 rounded-md bg-muted" aria-hidden="true" />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 basis-full truncate text-sm font-medium text-foreground sm:basis-auto sm:flex-1">
              {idea.title}
            </span>
            <CategoryBadge category={idea.category} className="shrink-0" />
            {idea.status !== "idea" && <DateBadge status={idea.status} className="shrink-0" />}
          </div>
          {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        <FavoriteToggle
          favorite={idea.favorite}
          onClick={() => onToggleFavorite?.(idea.id)}
          className={cn(
            !idea.favorite &&
              "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100",
          )}
        />

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-within/row:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Agendar"
                onClick={() => onSchedule?.(idea.id)}
              >
                <CalendarPlus className="size-4" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Agendar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Editar"
                onClick={() => onEdit?.(idea.id)}
              >
                <Pencil className="size-4" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Mais ações">
              <MoreHorizontal className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSchedule?.(idea.id)}>
              <CalendarPlus data-icon="inline-start" />
              Agendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(idea.id)}>
              <Pencil data-icon="inline-start" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(idea.id)}>
              <Trash2 data-icon="inline-start" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

interface FavoriteToggleProps {
  favorite: boolean
  onClick?: () => void
  className?: string
}

function FavoriteToggle({ favorite, onClick, className }: FavoriteToggleProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      transition={{ duration: DURATION.fast }}
      onClick={onClick}
      aria-pressed={favorite}
      aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-[color,opacity] duration-150 hover:text-warning",
        className,
      )}
    >
      <Star
        className={cn("size-4 transition-colors", favorite && "fill-current text-warning")}
        strokeWidth={1.75}
      />
    </motion.button>
  )
}
