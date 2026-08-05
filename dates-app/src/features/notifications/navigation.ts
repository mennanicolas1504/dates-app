import type { NotificationRecord } from "@/features/notifications/types"
import { paths } from "@/routes/paths"

export interface NotificationTarget {
  pathname: string
  /** Mesmo mecanismo de deep-link que `AlbumPage` já usa para "Última memória" (ver `home-page.tsx`, `openMemoryId`). */
  state?: { openIdeaId?: string; openMemoryId?: string }
}

/**
 * Pra onde navegar ao abrir uma notificação — sempre uma tela que já existe
 * e já sabe mostrar aquele recurso, nunca uma rota nova (Fase 20: "continuar
 * reutilizando componentes existentes"). Ideias/Memórias reaproveitam o
 * mesmo padrão de deep-link por `location.state` que `AlbumPage` já usa.
 */
export function resolveNotificationTarget(notification: NotificationRecord): NotificationTarget {
  switch (notification.type) {
    case "idea_created":
    case "idea_updated":
    case "idea_planned":
    case "idea_date_changed":
      return notification.resourceId
        ? { pathname: paths.ideias, state: { openIdeaId: notification.resourceId } }
        : { pathname: paths.ideias }

    case "idea_completed":
    case "memory_photos_added":
      return notification.resourceId
        ? { pathname: paths.album, state: { openMemoryId: notification.resourceId } }
        : { pathname: paths.album }

    case "couple_photo_changed":
    case "space_cover_changed":
      return { pathname: paths.profile }

    case "member_joined":
    case "member_left":
    case "ownership_transferred":
    case "invite_created":
      return { pathname: paths.spaceSettings }

    default:
      return { pathname: paths.home }
  }
}
