import * as React from "react"
import { CheckCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { SkeletonList } from "@/components/common/skeletons"
import { Typography } from "@/components/common/typography"
import { Button } from "@/components/ui/button"
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api"
import { NotificationList } from "@/features/notifications/components/notification-list"
import { resolveNotificationTarget } from "@/features/notifications/navigation"
import type { NotificationRecord } from "@/features/notifications/types"
import { refreshUnreadNotificationsCount } from "@/features/notifications/unread-store"
import { useNotificationThumbnails } from "@/hooks/use-notification-thumbnails"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"

export function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = React.useState<NotificationRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  // Mesmo sentinel de 3 estados do resto do app (ver `IdeiasPage`/`AlbumPage`):
  // reseta em render, não dentro do efeito, sempre que o usuário muda de identidade.
  const [loadedUserId, setLoadedUserId] = React.useState<string | null | undefined>(undefined)
  const [markingAll, setMarkingAll] = React.useState(false)

  const userId = user?.id ?? null
  if (userId !== loadedUserId) {
    setLoadedUserId(userId)
    setLoading(userId !== null)
    setNotifications([])
  }

  React.useEffect(() => {
    if (!userId) return

    let cancelled = false

    fetchNotifications(userId).then(({ notifications: fetched, error }) => {
      if (cancelled) return
      if (error) {
        toast.error({ title: "Não foi possível carregar as notificações", description: error })
        setLoading(false)
        return
      }
      setNotifications(fetched)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const thumbnailUrls = useNotificationThumbnails(notifications)
  const unreadCount = notifications.filter((item) => item.readAt === null).length

  // A leitura acontece ao abrir (Fase 20: "a leitura deve acontecer
  // automaticamente ao abrir uma notificação") — otimista no estado local,
  // a chamada ao banco não bloqueia a navegação.
  const handleOpen = (notification: NotificationRecord) => {
    if (notification.readAt === null) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      )
      markNotificationRead(notification.id).then(() => refreshUnreadNotificationsCount(userId))
    }

    const target = resolveNotificationTarget(notification)
    navigate(target.pathname, target.state ? { state: target.state } : undefined)
  }

  const handleMarkAllRead = async () => {
    if (!userId || unreadCount === 0) return

    setMarkingAll(true)
    const { error } = await markAllNotificationsRead(userId)
    setMarkingAll(false)

    if (error) {
      toast.error({ title: "Não foi possível marcar tudo como lido", description: error })
      return
    }

    setNotifications((prev) =>
      prev.map((item) => (item.readAt === null ? { ...item, readAt: new Date().toISOString() } : item)),
    )
    void refreshUnreadNotificationsCount(userId)
  }

  if (!user) return null

  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <PageTitle>Notificações</PageTitle>
          <Typography variant="subtitle">O que aconteceu no espaço de vocês.</Typography>
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} loading={markingAll}>
            <CheckCheck data-icon="inline-start" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonList rows={6} />
      ) : (
        <NotificationList notifications={notifications} thumbnailUrls={thumbnailUrls} onOpen={handleOpen} />
      )}
    </PageContainer>
  )
}
