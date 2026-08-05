import { LogOut, Menu } from "lucide-react"
import { Link } from "react-router-dom"

import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { paths } from "@/routes/paths"
import { useAuth } from "@/providers/auth-provider"
import { useSidebar } from "@/providers/sidebar-provider"

export function Header() {
  const { setMobileOpen } = useSidebar()
  const { signOut, space, user } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/60 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="text-muted-foreground md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-[18px]" strokeWidth={1.75} />
      </Button>

      <div className="flex min-w-0 flex-1 items-center justify-center px-2 md:justify-start md:px-0">
        {space && (
          <Link
            to={paths.spaceSettings}
            className="truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {space.name}
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Link
              to={paths.profile}
              aria-label="Perfil"
              className="flex size-8 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar size="sm">
                <AvatarFallback>{(user?.email ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom">Perfil</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void signOut()}
              className="text-muted-foreground"
              aria-label="Sair"
            >
              <LogOut className="size-[18px]" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Sair</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
