import { AnimatePresence, motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { BottomNav } from "@/components/layout/bottom-nav"
import { Header } from "@/components/layout/header"

/**
 * Casco do app — Header fixo em cima, Bottom Navigation fixa embaixo, só o
 * meio rola. Sem Sidebar (Fase 15): o Dates deixou de ser "site com menu
 * lateral" e passou a se comportar como um aplicativo mobile em qualquer
 * tamanho de tela, não só no celular.
 */
export function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-background text-foreground">
      <Header />

      <main
        className="relative flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  )
}
