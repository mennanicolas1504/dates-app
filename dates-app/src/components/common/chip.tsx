import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChipProps extends React.ComponentProps<"span"> {
  selected?: boolean
  onRemove?: () => void
}

export function Chip({
  children,
  selected = false,
  onRemove,
  className,
  ...props
}: ChipProps) {
  return (
    <span
      data-selected={selected}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors",
        selected && "border-transparent bg-primary text-primary-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1 flex size-4 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
          aria-label="Remover"
        >
          <X className="size-3" strokeWidth={2} />
        </button>
      )}
    </span>
  )
}
