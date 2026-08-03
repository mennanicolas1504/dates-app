import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getSuggestions } from "@/features/ideias/data/idea-suggestions"

interface SuggestionSelection {
  title: string
  category: string
}

interface SuggestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (suggestion: SuggestionSelection) => void
  /**
   * Cidade do casal, para filtrar sugestões localizadas no futuro. Nesta
   * fase todas as sugestões são genéricas, então isto ainda não restringe
   * nada na prática — o encanamento já existe para quando a base de
   * sugestões por cidade chegar (ver `getSuggestions`).
   */
  city?: string
}

/**
 * Coleção de ideias prontas para inspirar — nada de viagem/turismo. Ao
 * escolher uma, apenas pré-preenche o modal "Nova ideia"; nada é salvo aqui.
 */
export function SuggestionsDialog({
  open,
  onOpenChange,
  onSelect,
  city,
}: SuggestionsDialogProps) {
  const suggestions = getSuggestions(city)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sugestões</DialogTitle>
          <DialogDescription>
            Escolha uma para começar — você edita tudo antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() =>
                onSelect({ title: suggestion.title, category: suggestion.category })
              }
              className="flex flex-col items-center gap-2 rounded-lg px-2 py-3 text-center transition-colors hover:bg-surface-hover"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <suggestion.icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">{suggestion.title}</span>
                <span className="text-[11px] text-muted-foreground">{suggestion.category}</span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
