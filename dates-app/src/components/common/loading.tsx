import * as React from "react"
import { Loader2 } from "lucide-react"

import { iconSize, type IconSize } from "@/lib/icon-sizes"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.ComponentProps<"div"> {
  size?: IconSize
  label?: string
}

export function Loading({ size = "md", label, className, ...props }: LoadingProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Loader2
        className="animate-spin"
        size={iconSize[size]}
        strokeWidth={1.75}
      />
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Carregando</span>
    </div>
  )
}
