import { motion } from "framer-motion"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getGreeting } from "@/lib/date"
import { DURATION, EASE_OUT } from "@/lib/motion"

interface GreetingCardProps {
  displayName: string
  spaceName: string
  avatarUrl?: string
  fallbackLabel: string
}

/**
 * Fundo em degradê roxo, de propósito — é o slot que a Fase 17
 * (Personalização) vai preencher com a foto do casal ou a capa do espaço
 * (`kind: "couple_photo" | "space_cover"`, já existentes no Sistema de
 * Mídia desde a Fase 9.2, só nunca usados). Trocar o gradiente por uma
 * `<img>` real ali dentro não muda a estrutura do card nem quem o usa.
 */
export function GreetingCard({ displayName, spaceName, avatarUrl, fallbackLabel }: GreetingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-brand/25 via-brand/10 to-transparent"
      />

      <div className="relative flex items-center gap-3 px-4 py-5">
        <Avatar size="lg">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback className="text-base">{fallbackLabel}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-lg font-semibold tracking-tight text-foreground">
            {getGreeting()}, {displayName}
          </span>
          <span className="truncate text-sm text-muted-foreground">{spaceName}</span>
        </div>
      </div>
    </motion.div>
  )
}
