import { motion } from "framer-motion"
import { PanelLeft } from "lucide-react"

import { SidebarNav } from "@/components/layout/sidebar/sidebar-nav"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { navItems } from "@/config/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/providers/sidebar-provider"

const EXPANDED_WIDTH = 248
const COLLAPSED_WIDTH = 72

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden h-svh shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex"
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">
          D
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight">
            {siteConfig.name}
          </span>
        )}
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="py-3">
          <SidebarNav items={navItems} collapsed={collapsed} />
        </div>
      </ScrollArea>

      <Separator />

      <div className={cn("flex shrink-0 p-2", collapsed && "justify-center")}>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="text-muted-foreground"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              <PanelLeft className="size-[18px]" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Expandir menu" : "Recolher menu"}
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.aside>
  )
}
