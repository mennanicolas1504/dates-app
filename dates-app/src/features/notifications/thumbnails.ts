import type { NotificationRecord } from "@/features/notifications/types"
import type { MediaKind } from "@/lib/media/types"

/**
 * A que `MediaKind` consultar para resolver a miniatura de uma notificação.
 * Só `experience`/`space` têm mídia visível para os dois membros do espaço
 * (ver RLS de `media`, 011_media.sql) — `profile` (avatar) é estritamente
 * privado por decisão já tomada no Sistema de Mídia (ver
 * `SpaceMembersList`, "só iniciais, nunca a foto de perfil de outro
 * membro"), então nunca tenta buscar. `null` = sem miniatura, só o ícone do
 * tipo (ver `NOTIFICATION_ICONS`).
 */
export function thumbnailKindFor(notification: NotificationRecord): MediaKind | null {
  switch (notification.resourceKind) {
    case "experience":
      return notification.type === "idea_completed" || notification.type === "memory_photos_added"
        ? "experience"
        : "idea"
    case "space":
      return notification.type === "couple_photo_changed" ? "couple_photo" : "space_cover"
    default:
      return null
  }
}
