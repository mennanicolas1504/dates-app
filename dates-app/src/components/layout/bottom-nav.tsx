import { motion } from "framer-motion"
import { NavLink } from "react-router-dom"

import { navItems } from "@/config/nav"
import { DURATION } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/nav"

/**
 * Substitui a Sidebar (Fase 15) — app pensado como aplicativo mobile, não
 * site com menu lateral. Fixa no rodapé, mesmas 4 rotas de sempre (ver
 * `config/nav.ts`); `env(safe-area-inset-bottom)` evita ficar por baixo da
 * barra de gestos em iPhones com notch/home indicator.
 */
export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {navItems.map((item) => (
          <BottomNavItem key={item.href} item={item} />
        ))}
      </div>
    </nav>
  )
}

function BottomNavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      className="group relative flex min-w-16 flex-1 flex-col items-center justify-center gap-0.5 py-2.5"
    >
      {({ isActive }) => (
        <>
          <motion.span
            whileTap={{ scale: 0.85 }}
            transition={{ duration: DURATION.fast }}
            className={cn(
              "flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors duration-150",
              isActive && "text-primary",
            )}
          >
            <item.icon
              className="size-[22px]"
              strokeWidth={isActive ? 2.1 : 1.75}
              fill={isActive ? "currentColor" : "none"}
              fillOpacity={isActive ? 0.12 : 0}
            />
          </motion.span>
          <span
            className={cn(
              "text-[11px] font-medium text-muted-foreground transition-colors duration-150",
              isActive && "text-primary",
            )}
          >
            {item.title}
          </span>
        </>
      )}
    </NavLink>
  )
}
