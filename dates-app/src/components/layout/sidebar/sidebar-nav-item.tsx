import { NavLink } from "react-router-dom"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/nav"

interface SidebarNavItemProps {
  item: NavItem
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNavItem({
  item,
  collapsed,
  onNavigate,
}: SidebarNavItemProps) {
  const link = (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-0",
          isActive && "bg-accent text-accent-foreground",
        )
      }
    >
      <item.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.title}
      </TooltipContent>
    </Tooltip>
  )
}
