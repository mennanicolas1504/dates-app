import { IMAGE_MIME_TYPES } from "@/lib/media/types"
import type { MediaConstraints, MediaKind } from "@/lib/media/types"

const MB = 1024 * 1024

/**
 * Único lugar que sabe os limites de cada domínio de mídia. Adicionar uma
 * `kind` nova (ver `types.ts`) é adicionar uma linha aqui — nunca é preciso
 * tocar em `api.ts`, `validate.ts` ou em qualquer componente.
 */
export const MEDIA_CONSTRAINTS: Record<MediaKind, MediaConstraints> = {
  idea: {
    mediaType: "image",
    maxSizeBytes: 5 * MB,
    maxCount: 6,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  experience: {
    mediaType: "image",
    maxSizeBytes: 5 * MB,
    maxCount: 10,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  album: {
    mediaType: "image",
    maxSizeBytes: 8 * MB,
    maxCount: null,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  space_cover: {
    mediaType: "image",
    maxSizeBytes: 8 * MB,
    maxCount: 1,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  couple_photo: {
    mediaType: "image",
    maxSizeBytes: 8 * MB,
    maxCount: 1,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  app_background: {
    mediaType: "image",
    maxSizeBytes: 8 * MB,
    maxCount: 1,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  user_avatar: {
    mediaType: "image",
    maxSizeBytes: 4 * MB,
    maxCount: 1,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
}

export function constraintsFor(kind: MediaKind): MediaConstraints {
  return MEDIA_CONSTRAINTS[kind]
}
