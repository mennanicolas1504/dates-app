import * as React from "react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface DividerProps extends React.ComponentProps<typeof Separator> {
  label?: string
}

export function Divider({ label, className, ...props }: DividerProps) {
  if (!label) {
    return <Separator className={className} {...props} />
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Separator className="flex-1" {...props} />
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <Separator className="flex-1" {...props} />
    </div>
  )
}
