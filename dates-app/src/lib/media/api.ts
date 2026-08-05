import { compressImage } from "@/lib/media/compress"
import { constraintsFor } from "@/lib/media/constraints"
import { withRetry } from "@/lib/media/retry"
import {
  getCachedSignedUrl,
  invalidateSignedUrl,
  setCachedSignedUrl,
  SIGNED_URL_EXPIRES_IN,
} from "@/lib/media/signed-url-cache"
import { buildStoragePath, resolveBucket } from "@/lib/media/storage"
import { withTimeout } from "@/lib/media/timeout"
import { mapMediaRow } from "@/lib/media/types"
import type { MediaError, MediaKind, MediaRecord, UploadMediaInput } from "@/lib/media/types"
import { validateCount, validateFile } from "@/lib/media/validate"
import { supabase } from "@/lib/supabase"

interface UploadMediaResult {
  media: MediaRecord | null
  error: MediaError | null
}

interface MediaListResult {
  media: MediaRecord[]
  error: MediaError | null
}

interface MediaActionResult {
  error: MediaError | null
}

function unknownError(error: unknown): MediaError {
  return {
    code: "unknown",
    message: error instanceof Error ? error.message : "Erro inesperado.",
  }
}

async function nextPosition(kind: MediaKind, resourceId: string): Promise<number> {
  const { data } = await withTimeout(() =>
    supabase
      .from("media")
      .select("position")
      .eq("kind", kind)
      .eq("resource_id", resourceId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle(),
  )

  return data ? data.position + 1 : 0
}

/**
 * Lista mídia de um recurso, na ordem — a consulta que toda tela de mídia
 * precisa antes de mostrar qualquer coisa.
 */
export async function listMedia(kind: MediaKind, resourceId: string): Promise<MediaListResult> {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("kind", kind)
    .eq("resource_id", resourceId)
    .order("position", { ascending: true })

  if (error) return { media: [], error: { code: "unknown", message: error.message } }
  return { media: (data ?? []).map(mapMediaRow), error: null }
}

/**
 * Mesma consulta que `listMedia`, mas para vários recursos de uma vez — a
 * consulta que uma lista precisa pra mostrar uma miniatura por item sem
 * disparar uma chamada por linha (ex: `IdeasList`). Devolve tudo junto, na
 * ordem; agrupar por `resourceId` é responsabilidade de quem chama.
 */
export async function listMediaForResources(
  kind: MediaKind,
  resourceIds: string[],
): Promise<MediaListResult> {
  if (resourceIds.length === 0) return { media: [], error: null }

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("kind", kind)
    .in("resource_id", resourceIds)
    .order("position", { ascending: true })

  if (error) return { media: [], error: { code: "unknown", message: error.message } }
  return { media: (data ?? []).map(mapMediaRow), error: null }
}

/**
 * Toda mídia de um espaço, de qualquer `kind` — usado só na exclusão do
 * espaço (ver `features/space/api.ts`, `deleteSpace`), para apagar os
 * arquivos do Storage antes de apagar a linha de `spaces`: o cascade de FK
 * (`media.space_id references spaces(id) on delete cascade`, ver
 * `011_media.sql`) limpa as linhas do banco sozinho, mas nunca os arquivos
 * no bucket — isso só a API resolve.
 */
export async function listMediaForSpace(spaceId: string): Promise<MediaListResult> {
  const { data, error } = await supabase.from("media").select("*").eq("space_id", spaceId)

  if (error) return { media: [], error: { code: "unknown", message: error.message } }
  return { media: (data ?? []).map(mapMediaRow), error: null }
}

/**
 * Upload único — valida, comprime (se a `kind` for de imagem), sobe pro
 * Storage e grava a linha em `media`. Se o insert falhar depois do upload
 * ter ido, desfaz o upload (evita arquivo órfão no bucket).
 */
export async function uploadMedia(input: UploadMediaInput): Promise<UploadMediaResult> {
  const constraints = constraintsFor(input.kind)

  const validationError = validateFile(input.file, input.kind)
  if (validationError) return { media: null, error: validationError }

  const countError = validateCount(
    input.kind,
    await countExisting(input.kind, input.resourceId),
    1,
  )
  if (countError) return { media: null, error: countError }

  let fileToUpload = input.file
  let width: number | null = null
  let height: number | null = null

  if (constraints.mediaType === "image") {
    const compressed = await compressImage(input.file)
    fileToUpload = compressed.file
    width = compressed.width || null
    height = compressed.height || null
  }

  const mediaId = crypto.randomUUID()
  const bucket = resolveBucket(input.kind)
  const storagePath = buildStoragePath({
    kind: input.kind,
    spaceId: input.spaceId,
    resourceId: input.resourceId,
    mediaId,
    mimeType: fileToUpload.type,
  })

  try {
    await withTimeout(() =>
      withRetry(() =>
        supabase.storage
          .from(bucket)
          .upload(storagePath, fileToUpload, { contentType: fileToUpload.type })
          .then(({ error }) => {
            if (error) throw error
          }),
      ),
    )
  } catch (error) {
    return { media: null, error: { code: "upload_failed", message: unknownError(error).message } }
  }

  const position = await nextPosition(input.kind, input.resourceId)

  const insertRow = () =>
    supabase
      .from("media")
      .insert({
        id: mediaId,
        kind: input.kind,
        space_id: input.spaceId,
        resource_id: input.resourceId,
        media_type: constraints.mediaType,
        storage_bucket: bucket,
        storage_path: storagePath,
        mime_type: fileToUpload.type,
        size_bytes: fileToUpload.size,
        width,
        height,
        position,
        created_by_id: input.createdById,
      })
      .select()
      .single()

  let insertResult: Awaited<ReturnType<typeof insertRow>>
  try {
    insertResult = await withTimeout(insertRow)
  } catch (error) {
    await supabase.storage.from(bucket).remove([storagePath])
    return { media: null, error: { code: "unknown", message: unknownError(error).message } }
  }
  const { data: row, error: insertError } = insertResult

  if (insertError || !row) {
    await supabase.storage.from(bucket).remove([storagePath])
    return {
      media: null,
      error: { code: "unknown", message: insertError?.message ?? "Não foi possível salvar a mídia." },
    }
  }

  return { media: mapMediaRow(row), error: null }
}

async function countExisting(kind: MediaKind, resourceId: string): Promise<number> {
  const { count } = await withTimeout(() =>
    supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("kind", kind)
      .eq("resource_id", resourceId),
  )

  return count ?? 0
}

/**
 * Upload múltiplo — sequencial, não paralelo. Cada arquivo só começa
 * depois do anterior terminar, pra `position` sair sempre correta sem
 * condição de corrida (ver `nextPosition`). Fundação não precisa do ganho
 * de velocidade de paralelizar; se algum dia precisar, é um upload em lote
 * com posições pré-calculadas, não uma mudança de contrato da API.
 */
export async function uploadMediaBatch(
  inputs: UploadMediaInput[],
): Promise<{ media: MediaRecord[]; errors: MediaError[] }> {
  const media: MediaRecord[] = []
  const errors: MediaError[] = []

  if (inputs.length === 0) return { media, errors }

  const { kind, resourceId } = inputs[0]
  const countError = validateCount(kind, await countExisting(kind, resourceId), inputs.length)
  if (countError) return { media, errors: [countError] }

  for (const input of inputs) {
    const { media: uploaded, error } = await uploadMedia(input)
    if (uploaded) media.push(uploaded)
    if (error) errors.push(error)
  }

  return { media, errors }
}

export async function deleteMedia(
  target: Pick<MediaRecord, "id" | "storageBucket" | "storagePath">,
): Promise<MediaActionResult> {
  try {
    const { error } = await withTimeout(() => supabase.from("media").delete().eq("id", target.id))
    if (error) return { error: { code: "unknown", message: error.message } }
  } catch (error) {
    return { error: { code: "unknown", message: unknownError(error).message } }
  }

  // Best-effort: a linha já foi removida (é o que importa pra RLS e pra
  // UI), então uma falha (ou um timeout) aqui não é reportada como erro —
  // só deixa um arquivo órfão no bucket, que uma limpeza futura pode varrer
  // (ver "Expansões futuras" no relatório). O timeout ainda importa: sem
  // ele, uma conexão travada aqui prende `deleteMedia` inteiro, mesmo a
  // linha já tendo sido apagada com sucesso.
  try {
    await withTimeout(() => supabase.storage.from(target.storageBucket).remove([target.storagePath]))
  } catch {
    // Ignorado de propósito — best-effort, ver comentário acima.
  }
  invalidateSignedUrl(target.storageBucket, target.storagePath)

  return { error: null }
}

/** Único ponto de update — só `position`, nunca substitui o arquivo em si. */
export async function reorderMedia(
  updates: { id: string; position: number }[],
): Promise<MediaActionResult> {
  for (const update of updates) {
    const { error } = await supabase
      .from("media")
      .update({ position: update.position })
      .eq("id", update.id)

    if (error) return { error: { code: "unknown", message: error.message } }
  }

  return { error: null }
}

export async function getSignedUrl(
  bucket: string,
  path: string,
): Promise<{ url: string | null; error: MediaError | null }> {
  const cached = getCachedSignedUrl(bucket, path)
  if (cached) return { url: cached, error: null }

  const createSignedUrlRequest = () =>
    supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_EXPIRES_IN)

  let signResult: Awaited<ReturnType<typeof createSignedUrlRequest>>
  try {
    signResult = await withTimeout(createSignedUrlRequest)
  } catch (timeoutError) {
    return { url: null, error: { code: "unknown", message: unknownError(timeoutError).message } }
  }
  const { data, error } = signResult

  if (error || !data) {
    return { url: null, error: { code: "unknown", message: error?.message ?? "Falha ao gerar link." } }
  }

  setCachedSignedUrl(bucket, path, data.signedUrl)
  return { url: data.signedUrl, error: null }
}
