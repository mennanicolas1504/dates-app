import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"

interface DatesMarkProps {
  /** `default` = tela de entrada (Login/Cadastro); `sm` = cabeçalhos secundários (Onboarding); `xs` = Header do app. */
  size?: "default" | "sm" | "xs"
  className?: string
}

const CONTAINER_SIZE = {
  default: "size-12",
  sm: "size-8",
  xs: "size-7",
} as const

const HEART_SIZE = {
  default: "size-8",
  sm: "size-[22px]",
  xs: "size-4",
} as const

/**
 * Símbolo próprio do Dates — dois corações minimalistas sobrepostos, na cor
 * de marca (mesma composição de opacidade que o símbolo anterior de dois
 * círculos: um mais claro atrás, um cheio na frente). Pequeno e simples de
 * propósito — nada grande, ilustrativo ou "românistico" (ver CLAUDE.md,
 * Fase 15: "sem corações grandes, românticos ou ilustrativos").
 */
export function DatesMark({ size = "default", className }: DatesMarkProps) {
  const heartSize = HEART_SIZE[size]

  return (
    <div className={cn("relative", CONTAINER_SIZE[size], className)} aria-hidden="true">
      <Heart className={cn("absolute top-0 left-0 fill-brand/45 text-brand/45", heartSize)} strokeWidth={0} />
      <Heart className={cn("absolute right-0 bottom-0 fill-brand text-brand", heartSize)} strokeWidth={0} />
    </div>
  )
}
