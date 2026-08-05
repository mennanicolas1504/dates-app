import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"

interface DatesMarkProps {
  className?: string
}

/**
 * Símbolo próprio do Dates — dois corações minimalistas sobrepostos, na cor
 * de marca (mesma composição de opacidade que o símbolo anterior de dois
 * círculos: um mais claro atrás, um cheio na frente). Pequeno e simples de
 * propósito — nada grande, ilustrativo ou "românistico" (ver CLAUDE.md,
 * Fase 15: "sem corações grandes, românticos ou ilustrativos").
 */
export function DatesMark({ className }: DatesMarkProps) {
  return (
    <div className={cn("relative size-12", className)} aria-hidden="true">
      <Heart
        className="absolute top-0 left-0 size-8 fill-brand/45 text-brand/45"
        strokeWidth={0}
      />
      <Heart className="absolute right-0 bottom-0 size-8 fill-brand text-brand" strokeWidth={0} />
    </div>
  )
}
