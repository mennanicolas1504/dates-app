import * as React from "react"
import { ChevronRight, LogOut, Palette, UserRound, Users2 } from "lucide-react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { Section } from "@/components/common/section"
import { SkeletonPage } from "@/components/common/skeletons"
import { Typography } from "@/components/common/typography"
import { fetchSpaceMembers } from "@/features/space/api"
import type { SpaceMember } from "@/features/space/types"
import { InviteLinkCard } from "@/features/invites/components/invite-link-card"
import { fetchProfile } from "@/features/profile/api"
import { ProfileAvatarForm } from "@/features/profile/components/profile-avatar-form"
import { ProfileNameForm } from "@/features/profile/components/profile-name-form"
import type { Profile } from "@/features/profile/types"
import { toast } from "@/hooks/use-toast"
import { formatShortDate } from "@/lib/date"
import { listMedia } from "@/lib/media/api"
import type { MediaRecord } from "@/lib/media/types"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

/**
 * Hub de configurações — Perfil, Espaço, Parceiro, Personalização (Fase 18),
 * Convites e Configurações, cada um sua própria seção (Fase 17). Nenhuma
 * lógica nova: "Espaço" continua sendo a página de gerenciamento completa
 * (`SpaceSettingsPage`, sair/transferir/excluir ficam só lá); "Convites"
 * aqui é o mesmo `InviteLinkCard` que já existe lá, não uma cópia.
 */
export function ProfilePage() {
  const { user, space, signOut } = useAuth()

  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [avatar, setAvatar] = React.useState<MediaRecord | null>(null)
  const [members, setMembers] = React.useState<SpaceMember[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null)

  const key = user && space ? `${user.id}:${space.id}` : null
  if (key !== loadedKey) {
    setLoadedKey(key)
    setProfile(null)
    setAvatar(null)
    setMembers([])
    setLoading(key !== null)
  }

  React.useEffect(() => {
    if (!user || !space) return

    let cancelled = false

    Promise.all([
      fetchProfile(user.id),
      listMedia("user_avatar", user.id),
      fetchSpaceMembers(space.id),
    ]).then(([profileResult, avatarResult, membersResult]) => {
      if (cancelled) return
      if (profileResult.error) {
        toast.error({ title: "Não foi possível carregar o perfil", description: profileResult.error })
        setLoading(false)
        return
      }

      setProfile(profileResult.profile)
      setAvatar(avatarResult.media[0] ?? null)
      setMembers(membersResult.members)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user, space])

  if (!user || !space) return null

  if (loading || !profile) {
    return (
      <PageContainer>
        <SkeletonPage />
      </PageContainer>
    )
  }

  const fallbackLabel = (profile.displayName ?? profile.email).charAt(0).toUpperCase()
  const partner = members.find((member) => member.profileId !== user.id) ?? null

  return (
    <PageContainer className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle>Perfil</PageTitle>
        <Typography variant="subtitle">Suas informações pessoais.</Typography>
      </div>

      <Section title="Perfil">
        <ProfileAvatarForm
          userId={user.id}
          media={avatar}
          fallbackLabel={fallbackLabel}
          onChanged={setAvatar}
        />
        <ProfileNameForm
          userId={user.id}
          initialName={profile.displayName ?? ""}
          onUpdated={(name) => setProfile({ ...profile, displayName: name })}
        />
      </Section>

      <Section title="Espaço">
        <Link
          to={paths.spaceSettings}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 shadow-xs transition-colors hover:bg-surface-hover"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users2 className="size-4" strokeWidth={1.75} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">{space.name}</span>
            <span className="text-xs text-muted-foreground">Nome, participantes, sair ou excluir.</span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        </Link>
      </Section>

      <Section title="Parceiro">
        {partner ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 shadow-xs">
            <Avatar>
              <AvatarFallback>{partner.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{partner.displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{partner.email}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="size-4" strokeWidth={1.75} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">Ainda sem parceiro(a)</span>
              <span className="text-xs text-muted-foreground">Compartilhe o convite abaixo para ele(a) entrar.</span>
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Personalização"
        description="Foto do casal, plano de fundo e capa do espaço — em breve."
      >
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-3 opacity-70">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Palette className="size-4" strokeWidth={1.75} />
          </div>
          <span className="flex-1 text-sm text-muted-foreground">Personalize a aparência do espaço</span>
          <Badge variant="secondary">Em breve</Badge>
        </div>
      </Section>

      <Section title="Convites" description="Compartilhe este link para seu par entrar automaticamente.">
        <InviteLinkCard spaceId={space.id} createdById={user.id} />
      </Section>

      <Section title="Configurações">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-3 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">E-mail</span>
            <span className="text-sm text-foreground">{profile.email}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Membro desde</span>
            <span className="text-sm text-foreground">{formatShortDate(new Date(profile.createdAt))}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left shadow-xs transition-colors hover:bg-surface-hover"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <LogOut className="size-4" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-medium text-danger">Sair da conta</span>
        </button>
      </Section>
    </PageContainer>
  )
}
