import { Chip } from "@/components/common/chip"
import { SearchInput } from "@/components/common/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AlbumFilter, AlbumSort } from "@/features/album/types"

interface AlbumToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filter: AlbumFilter
  onFilterChange: (value: AlbumFilter) => void
  sort: AlbumSort
  onSortChange: (value: AlbumSort) => void
}

const FILTERS: { value: AlbumFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "favorites", label: "Favoritas" },
  { value: "withPhotos", label: "Com fotos" },
  { value: "rated", label: "Com avaliação" },
]

/**
 * Uma única busca cobre título e local — dois campos de busca lado a lado
 * pesaria visualmente num álbum que quer ser "leve"; o texto digitado
 * simplesmente casa com qualquer um dos dois (ver `AlbumPage`).
 */
export function AlbumToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: AlbumToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={() => onSearchChange("")}
          placeholder="Buscar por título ou local..."
          className="w-full sm:w-64"
        />

        <Select value={sort} onValueChange={(value) => onSortChange(value as AlbumSort)}>
          <SelectTrigger size="sm" className="ml-auto min-w-32 sm:ml-0">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((item) => (
          <button key={item.value} type="button" onClick={() => onFilterChange(item.value)}>
            <Chip selected={filter === item.value} className="cursor-pointer">
              {item.label}
            </Chip>
          </button>
        ))}
      </div>
    </div>
  )
}
