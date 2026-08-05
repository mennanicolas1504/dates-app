import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface ListItemProps extends Omit<React.ComponentProps<"div">, "title"> {
  icon?: LucideIcon
  /** Substitui o ícone padrão por qualquer nó (ex: miniatura/avatar) — ver `NotificationItem`. */
  leading?: React.ReactNode
  title: string
  description?: string
  trailing?: React.ReactNode
  interactive?: boolean
}

export function ListItem({
  icon: Icon,
  leading,
  title,
  description,
  trailing,
  interactive = false,
  className,
  ...props
}: ListItemProps) {
  return (
    <div
      data-interactive={interactive}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
        interactive && "cursor-pointer hover:bg-surface-hover",
        className,
      )}
      {...props}
    >
      {leading ??
        (Icon && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-[16px]" strokeWidth={1.75} />
          </div>
        ))}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
        {description && (
          <span className="truncate text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      {trailing && (
        <div className="flex shrink-0 items-center gap-2">{trailing}</div>
      )}
    </div>
  )
}
