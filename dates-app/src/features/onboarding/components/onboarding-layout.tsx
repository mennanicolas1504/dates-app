import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Typography } from "@/components/common/typography"
import { Button } from "@/components/ui/button"
import { DatesMark } from "@/features/auth/components/dates-mark"
import { fadeIn, transition } from "@/lib/motion"

interface OnboardingLayoutProps {
  title: string
  description?: string
  children: ReactNode
  onBack?: () => void
}

/**
 * Mesma base do `AuthLayout` — símbolo da marca, fundo com os mesmos
 * blobs discretos, coluna única mobile-first. Onboarding é a continuação
 * direta do cadastro/login (mesma "primeira execução"); antes da Fase 19
 * essa tela não tinha nenhuma identidade visual, quebrando a continuidade
 * logo depois de sair do Login/Cadastro.
 */
export function OnboardingLayout({ title, description, children, onBack }: OnboardingLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">
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
        className="relative flex w-full max-w-sm flex-col gap-6"
      >
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 w-fit text-muted-foreground"
          >
            <ChevronLeft data-icon="inline-start" />
            Voltar
          </Button>
        )}

        <div className="flex flex-col items-center gap-4 text-center">
          <DatesMark size="sm" />
          <div className="flex flex-col gap-1">
            <Typography variant="heading" as="h1" className="text-xl">
              {title}
            </Typography>
            {description && <Typography variant="subtitle">{description}</Typography>}
          </div>
        </div>

        {children}
      </motion.div>
    </div>
  )
}
