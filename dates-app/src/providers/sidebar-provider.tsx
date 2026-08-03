import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

interface SidebarContextValue {
  collapsed: boolean
  toggleCollapsed: () => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const STORAGE_KEY = "dates-sidebar-collapsed"

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((prev) => !prev),
      mobileOpen,
      setMobileOpen,
    }),
    [collapsed, mobileOpen],
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
