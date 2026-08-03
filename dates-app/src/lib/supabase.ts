import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Não lança erro na inicialização: a aplicação (rotas, formulários,
  // validação) continua inspecionável sem credenciais. Só as chamadas reais
  // de autenticação falham até isso ser configurado — ver .env.example.
  console.error(
    "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local (ver .env.example). A autenticação não vai funcionar até isso ser feito.",
  )
}

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
)
