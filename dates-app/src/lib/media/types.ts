import type { Tables } from "@/types/database"

/**
 * A quem a mídia pertence. Cada valor aqui corresponde a uma linha em
 * `MEDIA_CONSTRAINTS` (ver `constraints.ts`) — adicionar um novo domínio de
 * mídia é adicionar um valor aqui + uma entrada lá, nunca uma tabela ou
 * bucket novo (ver `supabase/migrations/011_media.sql`).
 */
export type MediaKind =
  | "idea"
  | "experience"
  | "album"
  | "space_cover"
  | "couple_photo"
  | "app_background"
  | "user_avatar"

/**
 * Discriminador de formato — hoje só "image" é implementado (compressão,
 * dimensões, preview). Os outros existem no tipo desde já para que suportar
 * vídeo/áudio/gif/documento no futuro seja estender uniões e `switch`es,
 * nunca mexer em Storage, RLS ou na forma da API (ver `api.ts`,
 * `compress.ts`). "audio" entra desde já pensando em gravações, mensagens
 * de voz, músicas e memórias em áudio — nenhuma tela usa isso ainda.
 */
export type MediaType = "image" | "video" | "audio" | "gif" | "document"

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const

export interface MediaConstraints {
  mediaType: MediaType
  maxSizeBytes: number
  /** `null` = sem limite de quantidade (ex: Álbum). */
  maxCount: number | null
  allowedMimeTypes: readonly string[]
}

/** Espelha `public.media` (ver `011_media.sql`), em camelCase. */
export interface MediaRecord {
  id: string
  kind: MediaKind
  /** `null` só para mídia de escopo do usuário (hoje: `user_avatar`). */
  spaceId: string | null
  /** Id do recurso do sistema dono desta mídia (ex: id da idea/experience) — não necessariamente um usuário. */
  resourceId: string
  mediaType: MediaType
  storageBucket: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  position: number
  createdById: string | null
  /** ISO date string. */
  createdAt: string
}

export interface UploadMediaInput {
  kind: MediaKind
  /** Obrigatório para toda `kind` exceto `user_avatar`. */
  spaceId: string | null
  resourceId: string
  createdById: string
  file: File
}

export type MediaErrorCode =
  | "invalid_type"
  | "too_large"
  | "too_many"
  | "upload_failed"
  | "compress_failed"
  | "unknown"

export interface MediaError {
  code: MediaErrorCode
  message: string
}

/**
 * Status de um item durante o pipeline de upload — ver `use-media-upload.ts`.
 * Sem "done": ao terminar com sucesso, o item sai da fila (o chamador passa
 * a representá-lo pela lista de mídia já persistida, não mais por aqui).
 */
export type MediaUploadStatus = "pending" | "compressing" | "uploading" | "error"

export interface MediaUploadItem {
  /** Id local, gerado no cliente — existe antes do upload terminar. */
  localId: string
  file: File
  /** `URL.createObjectURL(file)` — sempre disponível, mesmo antes do upload. */
  previewUrl: string
  status: MediaUploadStatus
  progress: number
  error: MediaError | null
  media: MediaRecord | null
}

function isMediaType(value: string): value is MediaType {
  return (
    value === "image" ||
    value === "video" ||
    value === "audio" ||
    value === "gif" ||
    value === "document"
  )
}

function isMediaKind(value: string): value is MediaKind {
  return (
    value === "idea" ||
    value === "experience" ||
    value === "album" ||
    value === "space_cover" ||
    value === "couple_photo" ||
    value === "app_background" ||
    value === "user_avatar"
  )
}

/**
 * `kind`/`media_type` são `text` livre no banco (mesmo padrão de
 * `experiences.category` — sem `check`, sem enum do Postgres), então o
 * gerador de tipos não consegue restringir isso. Estreita sem `any`; um
 * valor fora da união (não deveria acontecer) cai em "album"/"image" como
 * fallback neutro em vez de quebrar a UI.
 */
export function mapMediaRow(row: Tables<"media">): MediaRecord {
  return {
    id: row.id,
    kind: isMediaKind(row.kind) ? row.kind : "album",
    spaceId: row.space_id,
    resourceId: row.resource_id,
    mediaType: isMediaType(row.media_type) ? row.media_type : "image",
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    position: row.position,
    createdById: row.created_by_id,
    createdAt: row.created_at,
  }
}
