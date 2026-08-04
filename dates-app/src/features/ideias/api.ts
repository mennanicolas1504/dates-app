import { mapExperienceRow } from "@/features/ideias/types"
import type { Idea, NewIdeaFormValues } from "@/features/ideias/types"
import { deleteMedia, listMedia } from "@/lib/media/api"
import { supabase } from "@/lib/supabase"

interface ExperiencesResult {
  experiences: Idea[]
  error: string | null
}

interface ExperienceResult {
  experience: Idea | null
  error: string | null
}

interface ExperienceActionResult {
  error: string | null
}

function creatorDisplayName(profile: { email: string; display_name: string | null }): string {
  return profile.display_name ?? profile.email.split("@")[0]
}

function experienceInsertValues(values: NewIdeaFormValues) {
  return {
    title: values.title,
    category: values.category,
    description: values.description || null,
    location: values.location || null,
    instagram: values.instagram || null,
    website: values.website || null,
    link: values.link || null,
    city: values.city || null,
    notes: values.notes || null,
  }
}

/**
 * Duas consultas, não um embed — mesmo padrão de `features/space/api.ts`.
 * `created_by_id` é só um uuid em `experiences`; o nome de exibição do autor
 * vem de uma busca em lote em `profiles` (RLS já permite ver o perfil de
 * quem divide espaço — ver `profiles_select_self_or_space_mate`).
 */
export async function fetchExperiencesForSpace(spaceId: string): Promise<ExperiencesResult> {
  const { data: rows, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false })

  if (error) return { experiences: [], error: error.message }
  if (!rows || rows.length === 0) return { experiences: [], error: null }

  const creatorIds = [...new Set(rows.map((row) => row.created_by_id).filter((id) => id !== null))]

  const namesById = new Map<string, string>()
  if (creatorIds.length > 0) {
    const { data: profileRows, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", creatorIds)

    if (profilesError) return { experiences: [], error: profilesError.message }

    for (const profile of profileRows ?? []) {
      namesById.set(profile.id, creatorDisplayName(profile))
    }
  }

  const experiences = rows.map((row) =>
    mapExperienceRow(row, row.created_by_id ? (namesById.get(row.created_by_id) ?? "Alguém") : "Alguém"),
  )

  return { experiences, error: null }
}

export async function createExperience(input: {
  spaceId: string
  createdById: string
  createdByName: string
  values: NewIdeaFormValues
}): Promise<ExperienceResult> {
  const { data: row, error } = await supabase
    .from("experiences")
    .insert({
      space_id: input.spaceId,
      created_by_id: input.createdById,
      ...experienceInsertValues(input.values),
    })
    .select()
    .single()

  if (error || !row) {
    return { experience: null, error: error?.message ?? "Não foi possível criar a experiência." }
  }

  return { experience: mapExperienceRow(row, input.createdByName), error: null }
}

export async function updateExperienceDetails(
  id: string,
  values: NewIdeaFormValues,
): Promise<ExperienceActionResult> {
  const { error } = await supabase
    .from("experiences")
    .update(experienceInsertValues(values))
    .eq("id", id)

  return { error: error?.message ?? null }
}

export async function updateExperienceFavorite(
  id: string,
  favorite: boolean,
): Promise<ExperienceActionResult> {
  const { error } = await supabase.from("experiences").update({ favorite }).eq("id", id)
  return { error: error?.message ?? null }
}

/** Agendar sempre muda o status para "scheduled" — não existe reagendar sem status ligado à data. */
export async function scheduleExperience(
  id: string,
  scheduledDate: string,
): Promise<ExperienceActionResult> {
  const { error } = await supabase
    .from("experiences")
    .update({ status: "scheduled", scheduled_date: scheduledDate })
    .eq("id", id)

  return { error: error?.message ?? null }
}

/**
 * `resource_id` em `media` não é uma FK de verdade (ver `011_media.sql`),
 * então não existe cascade automático — apagar as fotos é responsabilidade
 * de quem consome o Sistema de Mídia. Best-effort e não bloqueante: se uma
 * foto falhar ao apagar, a ideia é excluída de qualquer forma (mesma
 * filosofia de `deleteMedia`, que também não deixa a limpeza do arquivo no
 * Storage bloquear a remoção da linha).
 */
export async function deleteExperience(id: string): Promise<ExperienceActionResult> {
  const { media } = await listMedia("idea", id)
  for (const item of media) {
    await deleteMedia(item)
  }

  const { error } = await supabase.from("experiences").delete().eq("id", id)
  return { error: error?.message ?? null }
}
