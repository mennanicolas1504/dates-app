import { Lightbulb, Plus, Sparkles } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"

interface IdeasEmptyStateProps {
  onCreate: () => void
  onSuggestions: () => void
}

/**
 * Composição sobre o EmptyState genérico do Design System — não o altera.
 * Ideias precisa de duas ações (criar do zero ou partir de uma sugestão),
 * então a segunda ação vive aqui, no domínio, como uma pequena ActionBar
 * logo abaixo do EmptyState.
 *
 * Padrão a repetir sempre que uma tela precisar complementar um componente
 * genérico do Design System sem alterar a responsabilidade dele: criar um
 * wrapper específico do domínio que usa o componente genérico internamente
 * e adiciona a personalização ao redor, nunca dentro do componente genérico.
 */
export function IdeasEmptyState({ onCreate, onSuggestions }: IdeasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <EmptyState
        icon={Lightbulb}
        title="Nenhuma ideia cadastrada ainda"
        description="Comece criando uma ideia do zero ou utilize uma das sugestões."
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSuggestions}>
          <Sparkles data-icon="inline-start" />
          Sugestões
        </Button>
        <Button size="sm" onClick={onCreate}>
          <Plus data-icon="inline-start" />
          Nova ideia
        </Button>
      </div>
    </div>
  )
}
