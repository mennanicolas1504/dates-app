import type { LucideIcon } from "lucide-react"
import {
  Beer,
  ChefHat,
  Clapperboard,
  Coffee,
  Film,
  Flame,
  Gauge,
  IceCreamCone,
  Landmark,
  Mic2,
  Mountain,
  Puzzle,
  Sandwich,
  ShoppingBag,
  Soup,
  Sun,
  Target,
  Trees,
  UtensilsCrossed,
  Gamepad2,
} from "lucide-react"

export interface IdeaSuggestion {
  id: string
  title: string
  category: string
  icon: LucideIcon
  /**
   * Cidades onde esta sugestão é relevante. `undefined` = sugestão genérica,
   * válida em qualquer cidade — todas as sugestões desta fase são assim.
   * Quando existir uma base maior de sugestões localizadas (fase futura),
   * preencher este campo passa a restringir a sugestão às cidades listadas.
   * `getSuggestions` já implementa esse filtro.
   */
  cities?: string[]
}

export const ideaSuggestions: IdeaSuggestion[] = [
  { id: "sushi", title: "Sushi", category: "Restaurante", icon: UtensilsCrossed },
  { id: "hamburguer", title: "Hambúrguer", category: "Restaurante", icon: Sandwich },
  { id: "churrasco", title: "Churrasco", category: "Em casa", icon: Flame },
  { id: "cafeteria", title: "Cafeteria", category: "Cafeteria", icon: Coffee },
  { id: "sorveteria", title: "Sorveteria", category: "Passeio", icon: IceCreamCone },
  { id: "cinema", title: "Cinema", category: "Cinema", icon: Clapperboard },
  { id: "escape-room", title: "Escape Room", category: "Evento", icon: Puzzle },
  { id: "boliche", title: "Boliche", category: "Passeio", icon: Target },
  { id: "kart", title: "Kart", category: "Passeio", icon: Gauge },
  { id: "parque", title: "Parque", category: "Passeio", icon: Trees },
  { id: "happy-hour", title: "Happy Hour", category: "Bar", icon: Beer },
  { id: "brunch", title: "Brunch", category: "Restaurante", icon: Soup },
  { id: "piquenique", title: "Piquenique", category: "Passeio", icon: Sun },
  { id: "trilha", title: "Trilha", category: "Passeio", icon: Mountain },
  { id: "cozinhar-juntos", title: "Cozinhar juntos", category: "Em casa", icon: ChefHat },
  { id: "noite-de-jogos", title: "Noite de jogos", category: "Em casa", icon: Gamepad2 },
  { id: "filme-em-casa", title: "Assistir filme em casa", category: "Em casa", icon: Film },
  { id: "standup", title: "Stand-up", category: "Evento", icon: Mic2 },
  { id: "museu", title: "Museu", category: "Cultura", icon: Landmark },
  { id: "feira-gastronomica", title: "Feira gastronômica", category: "Evento", icon: ShoppingBag },
]

/**
 * Retorna as sugestões válidas para uma cidade. Nesta fase todas as
 * sugestões são genéricas (`cities` indefinido), então `city` ainda não
 * filtra nada na prática — a função já existe pronta para quando uma base
 * de sugestões localizadas por cidade for adicionada.
 */
export function getSuggestions(city?: string): IdeaSuggestion[] {
  if (!city) return ideaSuggestions
  return ideaSuggestions.filter((suggestion) => !suggestion.cities || suggestion.cities.includes(city))
}
