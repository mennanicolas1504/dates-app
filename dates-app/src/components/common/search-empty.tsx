import { SearchX } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"

interface SearchEmptyProps {
  query?: string
  onClear?: () => void
  className?: string
}

/**
 * Estado vazio específico para busca/filtro sem resultado — distinto do
 * EmptyState genérico porque a ação leva a limpar o filtro, nunca a criar
 * (ver UX_ARCHITECTURE.md, Seção 7.6).
 */
export function SearchEmpty({ query, onClear, className }: SearchEmptyProps) {
  return (
    <EmptyState
      icon={SearchX}
      title="Nenhum resultado encontrado"
      description={
        query
          ? `Não encontramos nada para "${query}".`
          : "Tente ajustar sua busca ou os filtros aplicados."
      }
      action={onClear ? { label: "Limpar busca", onClick: onClear } : undefined}
      className={className}
    />
  )
}
