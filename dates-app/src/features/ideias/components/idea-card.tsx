import { motion } from "framer-motion"
import { CalendarClock, CalendarPlus, CalendarX, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react"

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
import { formatShortDate, formatShortDateTime } from "@/lib/date"
import { DURATION } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { Idea } from "@/features/ideias/types"

interface IdeaCardProps {
  idea: Idea
  onToggleFavorite?: (id: string) => void
  onOpenDetails?: (id: string) => void
  /** Abre o `PlanDialog` — cobre tanto planejar quanto editar um planejamento existente. */
  onPlan?: (id: string) => void
  onCancelPlan?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
  /** true enquanto alguma ação assíncrona desta ideia está em voo — desabilita as ações da linha. */
  pending?: boolean
  /** Signed URL da primeira foto, já resolvida pela página (ver `useSignedMediaUrls`). `undefined` = sem foto. */
  thumbnailUrl?: string
}

/**
 * Linha compacta de ideia — não um card de catálogo. Em repouso mostra só o
 * essencial (título, categoria, quem/quando); estado "Ideia" (o padrão) não
 * ganha badge própria, só desvios dele (Planejada/Concluída). Favorito só
 * aparece sempre quando já é favorito — senão só ao passar o mouse — para
 * não poluir a maioria das linhas com um ícone vazio. Ver UX_ARCHITECTURE.md.
 */
export function IdeaCard({
  idea,
  onToggleFavorite,
  onOpenDetails,
  onPlan,
  onCancelPlan,
  onEdit,
  onDelete,
  className,
  pending = false,
  thumbnailUrl,
}: IdeaCardProps) {
  const isPlanned = idea.status === "scheduled"

  const meta = [
    isPlanned && idea.scheduledDate
      ? `Planejada p/ ${formatShortDateTime(new Date(idea.scheduledDate))}`
      : null,
    idea.location,
    idea.notes,
    `Por ${idea.createdBy}`,
    formatShortDate(new Date(idea.createdAt)),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div
      className={cn(
        "group/row flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover",
        pending && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpenDetails?.(idea.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
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
          disabled={pending}
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
                aria-label={isPlanned ? "Editar planejamento" : "Planejar"}
                disabled={pending}
                onClick={() => onPlan?.(idea.id)}
              >
                {isPlanned ? (
                  <CalendarClock className="size-4" strokeWidth={1.75} />
                ) : (
                  <CalendarPlus className="size-4" strokeWidth={1.75} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlanned ? "Editar planejamento" : "Planejar"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Editar"
                disabled={pending}
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
            <Button variant="ghost" size="icon-sm" aria-label="Mais ações" disabled={pending}>
              <MoreHorizontal className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPlan?.(idea.id)}>
              {isPlanned ? (
                <CalendarClock data-icon="inline-start" />
              ) : (
                <CalendarPlus data-icon="inline-start" />
              )}
              {isPlanned ? "Editar planejamento" : "Planejar"}
            </DropdownMenuItem>
            {isPlanned && (
              <DropdownMenuItem onClick={() => onCancelPlan?.(idea.id)}>
                <CalendarX data-icon="inline-start" />
                Cancelar planejamento
              </DropdownMenuItem>
            )}
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
  disabled?: boolean
  className?: string
}

function FavoriteToggle({ favorite, onClick, disabled, className }: FavoriteToggleProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      transition={{ duration: DURATION.fast }}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={favorite}
      aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-[color,opacity] duration-150 hover:text-warning disabled:pointer-events-none disabled:opacity-50",
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
