import { Button } from "@/components/ui/button"
import { Typography } from "@/components/common/typography"
import { cn } from "@/lib/utils"

interface NotFoundStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Estado reutilizável para uma rota inexistente. Apenas o componente visual —
 * ainda não conectado ao router (ver relatório desta fase).
 */
export function NotFoundState({
  title = "Página não encontrada",
  description = "O endereço que você tentou acessar não existe ou foi movido.",
  action,
  className,
}: NotFoundStateProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[60svh] flex-col items-center justify-center gap-4 px-6 text-center",
        className,
      )}
    >
      <span className="text-6xl font-semibold tracking-tight text-muted-foreground/30">
        404
      </span>
      <div className="flex flex-col gap-1">
        <Typography variant="title">{title}</Typography>
        <Typography variant="body" className="max-w-sm text-muted-foreground">
          {description}
        </Typography>
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
