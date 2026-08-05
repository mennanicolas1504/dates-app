import { motion } from "framer-motion"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getGreeting } from "@/lib/date"
import { DURATION, EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface GreetingCardProps {
  displayName: string
  spaceName: string
  avatarUrl?: string
  /** Foto do casal (`kind: "couple_photo"`) — quando existe, vira o avatar no lugar do individual (ver `HomePage`). */
  coupleAvatarUrl?: string
  /** Capa do espaço (`kind: "space_cover"`) — quando existe, substitui o degradê. */
  coverUrl?: string
  fallbackLabel: string
  /** Posição do card na Home — atrasa a entrada em cascata (ver `HomePage`). */
  delayIndex?: number
}

/**
 * Fase 18 (Personalização): com capa do espaço, o degradê dá lugar à foto
 * de verdade (com escurecimento pra legibilidade do texto por cima); sem
 * capa, continua o mesmo degradê roxo de sempre — nunca fica sem nada. O
 * avatar prioriza a foto do casal sobre a individual (a mesma ideia de
 * "avatar do casal" pedida na Fase 18 é só essa imagem mostrada em formato
 * circular, não uma `kind` nova).
 */
export function GreetingCard({
  displayName,
  spaceName,
  avatarUrl,
  coupleAvatarUrl,
  coverUrl,
  fallbackLabel,
  delayIndex = 0,
}: GreetingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: delayIndex * 0.06 }}
      className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10"
    >
      {coverUrl ? (
        <>
          <img src={coverUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-brand/25 via-brand/10 to-transparent"
        />
      )}

      <div className="relative flex items-center gap-3 px-4 py-5">
        <Avatar size="lg">
          {(coupleAvatarUrl ?? avatarUrl) && <AvatarImage src={coupleAvatarUrl ?? avatarUrl} alt="" />}
          <AvatarFallback className="text-base">{fallbackLabel}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              "truncate text-lg font-semibold tracking-tight",
              coverUrl ? "text-white" : "text-foreground",
            )}
          >
            {getGreeting()}, {displayName}
          </span>
          <span className={cn("truncate text-sm", coverUrl ? "text-white/80" : "text-muted-foreground")}>
            {spaceName}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
