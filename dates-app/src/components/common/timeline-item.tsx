import * as React from "react"

import { Rating } from "@/components/common/rating"
import { cn } from "@/lib/utils"

interface TimelineItemProps extends Omit<React.ComponentProps<"div">, "title" | "onClick"> {
  date: string
  title: string
  description?: string
  rating?: number
  thumbnail?: string
  /** Oculta o conector vertical — usar no último item da lista. */
  isLast?: boolean
  onClick?: () => void
}

/** Item reutilizável para uma linha do tempo (uso previsto: Histórico). */
export function TimelineItem({
  date,
  title,
  description,
  rating,
  thumbnail,
  isLast = false,
  onClick,
  className,
  ...props
}: TimelineItemProps) {
  const interactive = Boolean(onClick)

  return (
    <div className={cn("relative flex gap-4 pb-6", className)} {...props}>
      <div className="flex flex-col items-center">
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-foreground/60" />
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={!interactive}
        className={cn(
          "flex flex-1 items-start gap-3 rounded-lg text-left transition-colors",
          interactive ? "cursor-pointer hover:bg-surface-hover" : "cursor-default",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1 px-1 py-0.5">
          <span className="text-xs text-muted-foreground">{date}</span>
          <span className="text-sm font-medium text-foreground">{title}</span>
          {description && (
            <span className="line-clamp-2 text-xs text-muted-foreground">{description}</span>
          )}
          {typeof rating === "number" && <Rating value={rating} size="sm" className="mt-1" />}
        </div>

        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="size-14 shrink-0 rounded-md object-cover ring-1 ring-foreground/10"
          />
        )}
      </button>
    </div>
  )
}
