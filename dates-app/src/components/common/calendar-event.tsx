import * as React from "react"

import { cn } from "@/lib/utils"

interface CalendarEventProps extends Omit<React.ComponentProps<"button">, "title"> {
  title: string
}

/** Etiqueta compacta de evento usada dentro de uma célula do Calendar. */
export function CalendarEvent({ title, className, ...props }: CalendarEventProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full truncate rounded-sm bg-muted px-1.5 py-0.5 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground",
        className,
      )}
      {...props}
    >
      {title}
    </button>
  )
}
