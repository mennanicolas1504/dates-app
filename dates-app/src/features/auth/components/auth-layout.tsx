import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { Typography } from "@/components/common/typography"
import { DatesMark } from "@/features/auth/components/dates-mark"
import { fadeIn, transition } from "@/lib/motion"

interface AuthLayoutProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Layout compartilhado das telas de autenticação. Hierarquia fixa —
 * símbolo → wordmark → tagline da marca → formulário — em todas as 4 telas.
 *
 * Desde a Fase 15, `--primary`/`--ring` já são o roxo da marca globalmente
 * (ver `index.css`) — este layout não precisa mais de um override local.
 */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-5 py-12 sm:bg-muted sm:px-4 sm:py-16 dark:bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-foreground/[0.03] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-foreground/[0.03] blur-3xl"
      />

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={transition}
        className="relative flex w-full max-w-sm flex-col items-center gap-12"
      >
        <div className="flex flex-col items-center gap-6">
          <DatesMark />
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-3xl font-bold tracking-tighter text-foreground">Dates</span>
            <Typography
              variant="body"
              className="max-w-[220px] text-balance text-muted-foreground"
            >
              Planeje momentos. Viva experiências.
            </Typography>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 sm:rounded-3xl sm:bg-card sm:px-7 sm:py-8 sm:shadow-md sm:ring-1 sm:ring-foreground/5">
          <div className="flex flex-col gap-1">
            <Typography variant="title">{title}</Typography>
            {description && <Typography variant="caption">{description}</Typography>}
          </div>

          {children}
        </div>

        {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
      </motion.div>
    </div>
  )
}
