import { Plus, Sparkles } from "lucide-react"

import { SearchInput } from "@/components/common/search-input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type IdeasSortOption = "recent" | "title"

interface IdeasToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
  sort: IdeasSortOption
  onSortChange: (value: IdeasSortOption) => void
  onCreate?: () => void
  onSuggestions?: () => void
}

/** Pesquisar | Categoria | Ordenar — em uma única linha, com "Nova ideia" à direita. */
export function IdeasToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  sort,
  onSortChange,
  onCreate,
  onSuggestions,
}: IdeasToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange("")}
        placeholder="Pesquisar..."
        className="w-full sm:w-56"
      />

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger size="sm" className="min-w-32">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(value) => onSortChange(value as IdeasSortOption)}>
        <SelectTrigger size="sm" className="min-w-32">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Mais recentes</SelectItem>
          <SelectItem value="title">Título (A-Z)</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSuggestions}>
          <Sparkles data-icon="inline-start" />
          Sugestões
        </Button>
        <Button onClick={onCreate} size="sm" className="shrink-0">
          <Plus data-icon="inline-start" />
          Nova ideia
        </Button>
      </div>
    </div>
  )
}
