import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Typography } from "@/components/common/typography"
import { cn } from "@/lib/utils"

interface StatCardProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: string
    direction?: "up" | "down" | "neutral"
  }
}

const trendColor: Record<NonNullable<StatCardProps["trend"]>["direction"] & string, string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-muted-foreground",
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("gap-0", className)} {...props}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Typography variant="caption">{label}</Typography>
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trendColor[trend.direction ?? "neutral"],
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
