import { mapNotificationRow } from "@/features/notifications/types"
import type { NotificationRecord } from "@/features/notifications/types"
import { supabase } from "@/lib/supabase"

interface NotificationsResult {
  notifications: NotificationRecord[]
  error: string | null
}

interface NotificationActionResult {
  error: string | null
}

/** Histórico recente do usuário logado — RLS já restringe a `recipient_id = auth.uid()` (ver 015_notifications.sql). */
export async function fetchNotifications(recipientId: string): Promise<NotificationsResult> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return { notifications: [], error: error.message }
  return { notifications: (data ?? []).map(mapNotificationRow), error: null }
}

/** Badge do sino — só a contagem, sem baixar as linhas. */
export async function fetchUnreadNotificationsCount(recipientId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .is("read_at", null)

  return count ?? 0
}

export async function markNotificationRead(id: string): Promise<NotificationActionResult> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null)

  return { error: error?.message ?? null }
}

export async function markAllNotificationsRead(recipientId: string): Promise<NotificationActionResult> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", recipientId)
    .is("read_at", null)

  return { error: error?.message ?? null }
}
