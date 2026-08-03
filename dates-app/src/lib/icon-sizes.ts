/**
 * Standardized Lucide icon sizes (px) used across the design system.
 * `md` matches the size already used in the app shell (Sidebar, Header).
 */
export const iconSize = {
  sm: 14,
  md: 18,
  lg: 22,
} as const

export type IconSize = keyof typeof iconSize
