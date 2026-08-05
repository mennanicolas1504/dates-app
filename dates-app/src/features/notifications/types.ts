import {
  ArrowLeftRight,
  CalendarClock,
  CalendarPlus,
  CircleCheck,
  Image,
  Images,
  LayoutPanelTop,
  Lightbulb,
  Link2,
  Pencil,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

import type { Tables } from "@/types/database"

/**
 * Os 12 eventos da Fase 20 — espelha exatamente os `type` gravados pelos
 * triggers `notify_*` (ver `supabase/migrations/015_notifications.sql`).
 * Livre no banco (`text`, sem `check`, mesmo padrão de `MediaKind` — ver
 * `lib/media/types.ts`), estreitado aqui do mesmo jeito: um valor fora da
 * união cai num ícone/rota neutros em vez de quebrar a UI.
 */
export type NotificationType =
  | "member_joined"
  | "member_left"
  | "idea_created"
  | "idea_updated"
  | "idea_planned"
  | "idea_date_changed"
  | "idea_completed"
  | "memory_photos_added"
  | "couple_photo_changed"
  | "space_cover_changed"
  | "invite_created"
  | "ownership_transferred"

/** A que domínio `resourceId` se refere — usado só para resolver miniatura/navegação (ver `notification-item.tsx`). */
export type NotificationResourceKind = "experience" | "space" | "profile" | null

export interface NotificationRecord {
  id: string
  spaceId: string
  recipientId: string
  actorId: string | null
  type: NotificationType
  /** Já formatado no banco (ex: "Ana criou uma nova ideia") — nunca recalculado no client. */
  title: string
  body: string | null
  resourceKind: NotificationResourceKind
  resourceId: string | null
  readAt: string | null
  createdAt: string
}

const NOTIFICATION_TYPES: readonly NotificationType[] = [
  "member_joined",
  "member_left",
  "idea_created",
  "idea_updated",
  "idea_planned",
  "idea_date_changed",
  "idea_completed",
  "memory_photos_added",
  "couple_photo_changed",
  "space_cover_changed",
  "invite_created",
  "ownership_transferred",
]

function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as string[]).includes(value)
}

function isResourceKind(value: string | null): value is NotificationResourceKind {
  return value === "experience" || value === "space" || value === "profile"
}

export function mapNotificationRow(row: Tables<"notifications">): NotificationRecord {
  return {
    id: row.id,
    spaceId: row.space_id,
    recipientId: row.recipient_id,
    actorId: row.actor_id,
    type: isNotificationType(row.type) ? row.type : "idea_updated",
    title: row.title,
    body: row.body,
    resourceKind: isResourceKind(row.resource_kind) ? row.resource_kind : null,
    resourceId: row.resource_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

/** Ícone por tipo — a UI nunca decide isso sozinha, sempre a partir do `type` gravado. */
export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  member_joined: UserPlus,
  member_left: UserMinus,
  idea_created: Lightbulb,
  idea_updated: Pencil,
  idea_planned: CalendarPlus,
  idea_date_changed: CalendarClock,
  idea_completed: CircleCheck,
  memory_photos_added: Images,
  couple_photo_changed: Image,
  space_cover_changed: LayoutPanelTop,
  invite_created: Link2,
  ownership_transferred: ArrowLeftRight,
}
