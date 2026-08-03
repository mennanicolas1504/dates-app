import { cn } from "@/lib/utils"

interface DatesMarkProps {
  className?: string
}

/**
 * Símbolo próprio do Dates — dois círculos na cor de marca, sobrepostos.
 * Não é literal (sem coração, sem pessoas, sem calendário): a interseção
 * representa o encontro/espaço compartilhado entre duas experiências —
 * conexão e planejamento, de forma abstrata. Sem imagem, sem ilustração.
 */
export function DatesMark({ className }: DatesMarkProps) {
  return (
    <div className={cn("relative size-12", className)} aria-hidden="true">
      <span className="absolute top-0 left-0 size-8 rounded-full bg-brand/45" />
      <span className="absolute right-0 bottom-0 size-8 rounded-full bg-brand" />
    </div>
  )
}
