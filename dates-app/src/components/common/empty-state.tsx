import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Typography } from "@/components/common/typography"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends Omit<React.ComponentProps<"div">, "title"> {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <Typography variant="title">{title}</Typography>
        {description && (
          <Typography variant="body" className="max-w-sm text-muted-foreground">
            {description}
          </Typography>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
