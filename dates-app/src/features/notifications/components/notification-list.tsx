import { Bell } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { Typography } from "@/components/common/typography"
import { NotificationItem } from "@/features/notifications/components/notification-item"
import type { NotificationRecord } from "@/features/notifications/types"
import { isSameDay } from "@/lib/date"

interface NotificationListProps {
  notifications: NotificationRecord[]
  thumbnailUrls: Map<string, string>
  onOpen: (notification: NotificationRecord) => void
}

/** Agrupa em "Hoje"/"Anteriores" — só o suficiente para dar contexto temporal a um histórico, sem virar um calendário. */
export function NotificationList({ notifications, thumbnailUrls, onOpen }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Nenhuma notificação ainda"
        description="Quando seu parceiro fizer algo no espaço de vocês, você vê aqui."
      />
    )
  }

  const now = new Date()
  const todayItems = notifications.filter((item) => isSameDay(new Date(item.createdAt), now))
  const earlierItems = notifications.filter((item) => !isSameDay(new Date(item.createdAt), now))

  return (
    <div className="flex flex-col gap-5">
      {todayItems.length > 0 && (
        <NotificationGroup label="Hoje" items={todayItems} thumbnailUrls={thumbnailUrls} onOpen={onOpen} />
      )}
      {earlierItems.length > 0 && (
        <NotificationGroup
          label="Anteriores"
          items={earlierItems}
          thumbnailUrls={thumbnailUrls}
          onOpen={onOpen}
        />
      )}
    </div>
  )
}

interface NotificationGroupProps {
  label: string
  items: NotificationRecord[]
  thumbnailUrls: Map<string, string>
  onOpen: (notification: NotificationRecord) => void
}

function NotificationGroup({ label, items, thumbnailUrls, onOpen }: NotificationGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      <Typography variant="label" className="px-3">
        {label}
      </Typography>
      <div className="flex flex-col">
        {items.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            thumbnailUrl={thumbnailUrls.get(notification.id)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}
