import { Home, Images, Lightbulb } from "lucide-react"

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
  {
    title: "Álbum",
    href: "/album",
    icon: Images,
  },
]
