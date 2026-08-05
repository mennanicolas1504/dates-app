import { AnimatePresence, motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { BottomNav } from "@/components/layout/bottom-nav"
import { Header } from "@/components/layout/header"

/**
 * Casco do app — Header fixo em cima, Bottom Navigation fixa embaixo, só o
 * meio rola. Sem Sidebar (Fase 15): o Dates deixou de ser "site com menu
 * lateral" e passou a se comportar como um aplicativo mobile em qualquer
 * tamanho de tela, não só no celular.
 *
 * Duas correções de arquitetura na Fase 19 (o app "terminava antes da
 * tela"): (1) o espaço reservado embaixo do conteúdo (`paddingBottom`)
 * usa `--bottom-nav-height`, medida de verdade pela própria `BottomNav`
 * (ver lá) — não mais um número chutado, que ficava alguns pixels menor
 * que a nav de verdade e deixava o último card colado ou coberto por ela.
 * (2) o wrapper de transição de página era `h-full` (limitado à altura
 * visível), não `min-h-full` — conteúdo mais alto que a tela ficava
 * preso dentro dessa caixa em vez de simplesmente crescer e deixar o
 * `overflow-y-auto` do `<main>` rolar até o fim de verdade.
 */
export function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-background text-foreground">
      <Header />

      <main
        className="relative flex-1 overflow-y-auto"
        style={{ paddingBottom: "var(--bottom-nav-height, 4.5rem)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  )
}
