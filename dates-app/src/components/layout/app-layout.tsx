import { AnimatePresence, motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { Header } from "@/components/layout/header"
import { MobileSidebar } from "@/components/layout/sidebar/mobile-sidebar"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { SidebarProvider } from "@/providers/sidebar-provider"

export function AppLayout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
        <Sidebar />
        <MobileSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <main className="relative flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
