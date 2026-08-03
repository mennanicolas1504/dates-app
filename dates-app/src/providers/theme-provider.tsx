import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeProviderProps {
  children: ReactNode
  storageKey?: string
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(storageKey: string): Theme {
  const stored = localStorage.getItem(storageKey)
  if (stored === "light" || stored === "dark") return stored

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function ThemeProvider({
  children,
  storageKey = "dates-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    getInitialTheme(storageKey),
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (next) => {
        localStorage.setItem(storageKey, next)
        setThemeState(next)
      },
      toggleTheme: () => {
        setThemeState((prev) => {
          const next = prev === "dark" ? "light" : "dark"
          localStorage.setItem(storageKey, next)
          return next
        })
      },
    }),
    [theme, storageKey],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
