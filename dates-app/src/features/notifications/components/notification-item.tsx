import { ListItem } from "@/components/common/list-item"
import { NOTIFICATION_ICONS } from "@/features/notifications/types"
import type { NotificationRecord } from "@/features/notifications/types"
import { formatRelativeTime } from "@/lib/date"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  notification: NotificationRecord
  thumbnailUrl?: string
  onOpen: (notification: NotificationRecord) => void
}

/**
 * Uma linha do histórico — miniatura (quando o recurso tem uma foto
 * resolvível, ver `useNotificationThumbnails`) ou o ícone do tipo,
 * título/descrição já prontos (gravados pelo trigger, ver `types.ts`), hora
 * relativa e um ponto discreto para "não lida". Reaproveita `ListItem`
 * (`components/common/`) em vez de montar a mesma estrutura de novo — sua
 * primeira aplicação real no app.
 */
export function NotificationItem({ notification, thumbnailUrl, onOpen }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type]
  const unread = notification.readAt === null

  return (
    <ListItem
      interactive
      onClick={() => onOpen(notification)}
      className={cn(unread && "bg-primary/[0.04]")}
      leading={
        thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="size-9 shrink-0 rounded-md object-cover ring-1 ring-foreground/10"
          />
        ) : (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md",
              unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-[16px]" strokeWidth={1.75} />
          </div>
        )
      }
      title={notification.title}
      description={notification.body ?? undefined}
      trailing={
        <div className="flex items-center gap-2">
          {unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatRelativeTime(new Date(notification.createdAt))}
          </span>
        </div>
      }
    />
  )
}
