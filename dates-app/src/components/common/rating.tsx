import * as React from "react"
import { Star } from "lucide-react"

import { iconSize, type IconSize } from "@/lib/icon-sizes"
import { cn } from "@/lib/utils"

interface RatingProps {
  /** Nota atual (0 a `max`). */
  value: number
  /** Se fornecido, o componente vira interativo (hover + clique). Omitido = somente leitura. */
  onChange?: (value: number) => void
  max?: number
  size?: IconSize
  className?: string
}

export function Rating({ value, onChange, max = 5, size = "md", className }: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const interactive = Boolean(onChange)
  const display = hovered ?? value

  return (
    <div
      role="img"
      aria-label={`Avaliação: ${value} de ${max}`}
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => interactive && setHovered(null)}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1
        const filled = starValue <= display

        return (
          <button
            key={starValue}
            type="button"
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onClick={() => interactive && onChange?.(starValue)}
            className={cn(
              "flex items-center justify-center text-muted-foreground/30 transition-colors",
              interactive
                ? "cursor-pointer rounded-sm hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "cursor-default",
              filled && "text-warning",
            )}
          >
            <Star size={iconSize[size]} className={cn(filled && "fill-current")} strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
