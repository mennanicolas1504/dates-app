import type { Transition, Variants } from "framer-motion"

/**
 * Shared animation language for the whole app. Every Framer Motion
 * animation should be built from these primitives so hover, focus,
 * modal, dropdown and page transitions all read as the same system.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const

export const DURATION = {
  fast: 0.12,
  base: 0.18,
  slow: 0.28,
} as const

export const transition: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT,
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

export const slideUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}
