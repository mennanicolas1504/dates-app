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

export interface PlanExperienceInput {
  scheduledDate: string
  location: string
  notes: string
}

/**
 * Planejar sempre muda o status para "scheduled" — cobre tanto planejar
 * pela primeira vez quanto editar um planejamento existente (mesma
 * operação: só um `update`, sem estado intermediário). `location`/`notes`
 * são os mesmos campos que a Ideia já usa (ver `experienceInsertValues`) —
 * planejar não duplica esses dados, só os edita a partir de outra tela.
 */
export async function planExperience(
  id: string,
  input: PlanExperienceInput,
): Promise<ExperienceActionResult> {
  const { error } = await supabase
    .from("experiences")
    .update({
      status: "scheduled",
      scheduled_date: input.scheduledDate,
      location: input.location || null,
      notes: input.notes || null,
    })
    .eq("id", id)

  return { error: error?.message ?? null }
}

/**
 * Volta a Ideia para o estágio inicial. Só `status` e `scheduled_date` são
 * limpos — `location`/`notes` continuam como dados válidos da Ideia, não
 * são exclusivos do planejamento (ver `PlanDialog`, que os edita nos dois
 * estágios usando os mesmos campos).
 */
export async function cancelExperiencePlan(id: string): Promise<ExperienceActionResult> {
  const { error } = await supabase
    .from("experiences")
    .update({ status: "idea", scheduled_date: null })
    .eq("id", id)

  return { error: error?.message ?? null }
}

export interface CompleteExperienceInput {
  completedAt: string
  rating: number | null
  notes: string
  actualCost: number | null
}

/**
 * Concluir sempre muda o status para "completed" — cobre tanto concluir
 * pela primeira vez quanto editar uma memória já registrada (mesma
 * operação, sem estado intermediário — mesmo padrão de `planExperience`).
 * Não exige ter passado por "scheduled": uma ideia pode virar experiência
 * vivida diretamente (encontro não planejado que só depois é registrado).
 * `scheduled_date` não é tocado — fica como registro histórico de quando
 * foi planejado, distinto de `completed_at` (quando aconteceu de fato).
 */
export async function completeExperience(
  id: string,
  input: CompleteExperienceInput,
): Promise<ExperienceActionResult> {
  const { error } = await supabase
    .from("experiences")
    .update({
      status: "completed",
      completed_at: input.completedAt,
      rating: input.rating,
      notes: input.notes || null,
      actual_cost: input.actualCost,
    })
    .eq("id", id)

  return { error: error?.message ?? null }
}

/**
 * `resource_id` em `media` não é uma FK de verdade (ver `011_media.sql`),
 * então não existe cascade automático — apagar as fotos é responsabilidade
 * de quem consome o Sistema de Mídia. Best-effort e não bloqueante: se uma
 * foto falhar ao apagar, a ideia é excluída de qualquer forma (mesma
 * filosofia de `deleteMedia`, que também não deixa a limpeza do arquivo no
 * Storage bloquear a remoção da linha). Duas `kind`s a limpar — mídia da
 * fase Ideia (inspiração) e da fase Experiência (memórias reais), ver
 * `012_experiences_actual_cost.sql` e a auditoria da Fase 11.
 */
export async function deleteExperience(id: string): Promise<ExperienceActionResult> {
  const [{ media: ideaMedia }, { media: experienceMedia }] = await Promise.all([
    listMedia("idea", id),
    listMedia("experience", id),
  ])

  for (const item of [...ideaMedia, ...experienceMedia]) {
    await deleteMedia(item)
  }

  const { error } = await supabase.from("experiences").delete().eq("id", id)
  return { error: error?.message ?? null }
}
