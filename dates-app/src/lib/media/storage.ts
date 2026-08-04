import type { MediaKind } from "@/lib/media/types"

export type MediaBucket = "media" | "avatars"

/** Só `user_avatar` mora no bucket separado — ver `011_media.sql`. */
export function resolveBucket(kind: MediaKind): MediaBucket {
  return kind === "user_avatar" ? "avatars" : "media"
}

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
}

export function extensionForMimeType(mimeType: string): string {
  return MIME_EXTENSIONS[mimeType] ?? "bin"
}

interface BuildStoragePathInput {
  kind: MediaKind
  spaceId: string | null
  resourceId: string
  mediaId: string
  mimeType: string
}

/**
 * Convenção de caminho — ver `011_media.sql` para a policy de RLS que
 * depende dela. O primeiro segmento é sempre o que a RLS de Storage checa
 * (`space_id` em `media`, `resource_id`/usuário em `avatars`); mudar esta
 * função exige revisar as policies de storage.objects também.
 */
export function buildStoragePath({
  kind,
  spaceId,
  resourceId,
  mediaId,
  mimeType,
}: BuildStoragePathInput): string {
  const extension = extensionForMimeType(mimeType)

  if (kind === "user_avatar") {
    return `${resourceId}/${mediaId}.${extension}`
  }

  if (!spaceId) {
    throw new Error(`spaceId é obrigatório para a kind "${kind}".`)
  }

  return `${spaceId}/${kind}/${resourceId}/${mediaId}.${extension}`
}
