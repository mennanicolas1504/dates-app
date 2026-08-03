import { SidebarNavItem } from "@/components/layout/sidebar/sidebar-nav-item"
import type { NavItem } from "@/types/nav"

interface SidebarNavProps {
  items: NavItem[]
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ items, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}
