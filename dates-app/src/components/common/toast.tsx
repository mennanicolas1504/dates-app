import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { ToastItem } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const variantConfig: Record<ToastItem["variant"], { icon: LucideIcon; className: string }> = {
  success: { icon: CheckCircle2, className: "text-success" },
  error: { icon: XCircle, className: "text-danger" },
  warning: { icon: AlertTriangle, className: "text-warning" },
  info: { icon: Info, className: "text-muted-foreground" },
}

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const { icon: Icon, className } = variantConfig[toast.variant]

  return (
    <div className="flex w-full max-w-sm items-start gap-3 rounded-xl bg-popover p-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
      <Icon className={cn("mt-0.5 size-[18px] shrink-0", className)} strokeWidth={1.75} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium">{toast.title}</span>
        {toast.description && (
          <span className="text-xs text-muted-foreground">{toast.description}</span>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-1 self-start text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dispensar notificação"
      >
        <X className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}
