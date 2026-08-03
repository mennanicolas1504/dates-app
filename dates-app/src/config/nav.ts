import { Home, Lightbulb } from "lucide-react"

import type { NavItem } from "@/types/nav"

export const navItems: NavItem[] = [
  {
    title: "Início",
    href: "/",
    icon: Home,
  },
  {
    title: "Ideias",
    href: "/ideias",
    icon: Lightbulb,
  },
]
