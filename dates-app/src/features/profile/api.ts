import { mapProfileRow } from "@/features/profile/types"
import type { Profile } from "@/features/profile/types"
import { supabase } from "@/lib/supabase"

interface ProfileResult {
  profile: Profile | null
  error: string | null
}

interface ProfileActionResult {
  error: string | null
}

export async function fetchProfile(userId: string): Promise<ProfileResult> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error || !data) {
    return { profile: null, error: error?.message ?? "Não foi possível carregar o perfil." }
  }

  return { profile: mapProfileRow(data), error: null }
}

export async function updateProfileName(userId: string, displayName: string): Promise<ProfileActionResult> {
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", userId)

  return { error: error?.message ?? null }
}
