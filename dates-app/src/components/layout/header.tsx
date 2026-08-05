import { Bell, Heart } from "lucide-react"
import { Link } from "react-router-dom"

import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { paths } from "@/routes/paths"

/**
 * Header mobile (Fase 15) — marca à esquerda, sino de notificações (ainda
 * sem função — preparação para a futura Central de Notificações) e o
 * alternador de tema à direita. Sem menu, sem nome do espaço, sem logout:
 * navegação agora é a Bottom Nav, e Sair só existe dentro de Perfil.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <Link to={paths.home} className="flex items-center gap-2">
        <span className="relative flex size-7 shrink-0 items-center justify-center">
          <Heart className="absolute top-0 left-0 size-4 fill-brand/45 text-brand/45" strokeWidth={0} />
          <Heart className="absolute right-0 bottom-0 size-4 fill-brand text-brand" strokeWidth={0} />
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">Dates</span>
      </Link>

      <div className="flex items-center gap-1">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label="Notificações"
            >
              <Bell className="size-[18px]" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notificações</TooltipContent>
        </Tooltip>
        <ThemeToggle />
      </div>
    </header>
  )
}
