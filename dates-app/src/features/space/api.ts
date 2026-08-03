import { supabase } from "@/lib/supabase"

interface SpaceActionResult {
  error: string | null
}

/**
 * Escrita do Espaço fora do AuthProvider de propósito — esta fase não
 * altera providers. Chama o Supabase diretamente; a reatividade (Header e
 * qualquer outro lugar que leia `useAuth().space`) continua funcionando
 * porque `supabase.auth.updateUser` dispara `onAuthStateChange`, que o
 * AuthProvider já escuta.
 */
export async function updateSpaceName(name: string): Promise<SpaceActionResult> {
  const { error } = await supabase.auth.updateUser({ data: { space_name: name } })
  return { error: error?.message ?? null }
}
