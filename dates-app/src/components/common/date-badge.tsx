import type { LucideIcon } from "lucide-react"
import { CalendarClock, CheckCircle2, Lightbulb, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type DateBadgeStatus = "idea" | "scheduled" | "completed" | "favorite"

interface StatusConfig {
  label: string
  icon: LucideIcon
  className: string
}

const statusConfig: Record<DateBadgeStatus, StatusConfig> = {
  idea: {
    label: "Ideia",
    icon: Lightbulb,
    className: "",
  },
  scheduled: {
    label: "Agendada",
    icon: CalendarClock,
    className: "",
  },
  completed: {
    label: "Concluída",
    icon: CheckCircle2,
    className: "border-transparent bg-success/10 text-success",
  },
  favorite: {
    label: "Favorita",
    icon: Star,
    className: "border-transparent bg-warning/10 text-warning [&_svg]:fill-current",
  },
}

interface DateBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "variant" | "children"> {
  status: DateBadgeStatus
}

/** Badge padronizado para o estado do ciclo de vida de uma Ideia (ver UX_ARCHITECTURE.md, Seção 2). */
export function DateBadge({ status, className, ...props }: DateBadgeProps) {
  const { label, icon: Icon, className: statusClassName } = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(statusClassName, className)} {...props}>
      <Icon data-icon="inline-start" />
      {label}
    </Badge>
  )
}
