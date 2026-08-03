import * as React from "react"

import { cn } from "@/lib/utils"

export function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8",
        className,
      )}
      {...props}
    />
  )
}
