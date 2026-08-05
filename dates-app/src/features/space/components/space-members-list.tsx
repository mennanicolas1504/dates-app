import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tag } from "@/components/common/tag"
import type { SpaceMember } from "@/features/space/types"

interface SpaceMembersListProps {
  members: SpaceMember[]
  currentUserId: string
}

/**
 * Só iniciais, nunca a foto de perfil de outro membro — a RLS de `media`
 * restringe `user_avatar` a `resource_id = auth.uid()` (ver `011_media.sql`),
 * então nem chega a existir um jeito de buscar a foto de quem divide o
 * espaço. Não é uma limitação desta tela, é a fronteira de privacidade já
 * decidida pelo Sistema de Mídia.
 */
export function SpaceMembersList({ members, currentUserId }: SpaceMembersListProps) {
  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => (
        <div
          key={member.profileId}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs"
        >
          <Avatar>
            <AvatarFallback>{member.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {member.displayName}
              {member.profileId === currentUserId && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">(você)</span>
              )}
            </span>
            <span className="truncate text-xs text-muted-foreground">{member.email}</span>
          </div>

          <Tag color={member.role === "owner" ? "success" : "default"} className="shrink-0">
            {member.role === "owner" ? "Dono" : "Membro"}
          </Tag>
        </div>
      ))}
    </div>
  )
}
