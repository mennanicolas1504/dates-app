import * as React from "react"
import { Bell } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DatesMark } from "@/features/auth/components/dates-mark"
import { refreshUnreadNotificationsCount, useUnreadNotificationsCount } from "@/features/notifications/unread-store"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

/**
 * Header mobile (Fase 15) — marca à esquerda, sino de notificações (Fase
 * 20: leva à Central de Notificações, com badge de não lidas) e o
 * alternador de tema à direita. Sem menu, sem nome do espaço, sem logout:
 * navegação agora é a Bottom Nav, e Sair só existe dentro de Perfil.
 */
export function Header() {
  const { user } = useAuth()
  const location = useLocation()
  const unreadCount = useUnreadNotificationsCount()

  // Sem realtime (ver `unread-store.ts`) — revalida a cada troca de rota,
  // que é como o app inteiro se comporta durante o uso normal (navegar
  // entre as 4 abas o tempo todo).
  React.useEffect(() => {
    void refreshUnreadNotificationsCount(user?.id ?? null)
  }, [user?.id, location.pathname])

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <Link to={paths.home} className="flex items-center gap-2">
        <DatesMark size="xs" />
        <span className="text-base font-semibold tracking-tight text-foreground">Dates ON</span>
      </Link>

      <div className="flex items-center gap-1">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground"
              aria-label="Notificações"
              asChild
            >
              <Link to={paths.notifications}>
                <Bell className="size-[18px]" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notificações</TooltipContent>
        </Tooltip>
        <ThemeToggle />
      </div>
    </header>
  )
}
