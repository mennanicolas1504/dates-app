import * as React from "react"

import { cn } from "@/lib/utils"

type TagColor = "default" | "success" | "warning" | "danger"

interface TagProps extends React.ComponentProps<"span"> {
  color?: TagColor
}

const dotColor: Record<TagColor, string> = {
  default: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
}

export function Tag({ color = "default", children, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotColor[color])} />
      {children}
    </span>
  )
}
