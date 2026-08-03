import * as React from "react"

import { Typography } from "@/components/common/typography"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <Typography variant="heading">{title}</Typography>
        {description && (
          <Typography variant="subtitle" className="max-w-2xl">
            {description}
          </Typography>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
