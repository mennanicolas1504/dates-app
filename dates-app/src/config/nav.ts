import { Home, Images, Lightbulb, User } from "lucide-react"

import type { NavItem } from "@/types/nav"

/** As 4 abas da Bottom Navigation (ver `components/layout/bottom-nav.tsx`) — mesmas rotas de sempre, só a forma de navegação muda (Fase 15). */
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
    title: "Memórias",
    href: "/album",
    icon: Images,
  },
  {
    title: "Perfil",
    href: "/perfil",
    icon: User,
  },
]
