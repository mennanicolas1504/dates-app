import * as React from "react"

import { Typography } from "@/components/common/typography"
import { cn } from "@/lib/utils"

interface SectionProps extends React.ComponentProps<"section"> {
  title?: string
  description?: string
}

export function Section({
  title,
  description,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)} {...props}>
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <Typography variant="title">{title}</Typography>}
          {description && <Typography variant="caption">{description}</Typography>}
        </div>
      )}
      {children}
    </section>
  )
}
