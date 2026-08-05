import * as React from "react"
import { ChevronRight, LogOut, Users2 } from "lucide-react"
import { Link } from "react-router-dom"

import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { Section } from "@/components/common/section"
import { SkeletonPage } from "@/components/common/skeletons"
import { Typography } from "@/components/common/typography"
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

export function ProfilePage() {
  const { user, signOut } = useAuth()

  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [avatar, setAvatar] = React.useState<MediaRecord | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadedUserId, setLoadedUserId] = React.useState<string | null>(null)

  const userId = user?.id ?? null
  if (userId !== loadedUserId) {
    setLoadedUserId(userId)
    setProfile(null)
    setAvatar(null)
    setLoading(userId !== null)
  }

  React.useEffect(() => {
    if (!user) return

    let cancelled = false

    Promise.all([fetchProfile(user.id), listMedia("user_avatar", user.id)]).then(
      ([{ profile: fetchedProfile, error }, { media }]) => {
        if (cancelled) return
        if (error) {
          toast.error({ title: "Não foi possível carregar o perfil", description: error })
          setLoading(false)
          return
        }

        setProfile(fetchedProfile)
        setAvatar(media[0] ?? null)
        setLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  if (loading || !profile) {
    return (
      <PageContainer>
        <SkeletonPage />
      </PageContainer>
    )
  }

  const fallbackLabel = (profile.displayName ?? profile.email).charAt(0).toUpperCase()

  return (
    <PageContainer className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle>Perfil</PageTitle>
        <Typography variant="subtitle">Suas informações pessoais.</Typography>
      </div>

      <Section>
        <ProfileAvatarForm
          userId={user.id}
          media={avatar}
          fallbackLabel={fallbackLabel}
          onChanged={setAvatar}
        />
      </Section>

      <Section title="Nome">
        <ProfileNameForm
          userId={user.id}
          initialName={profile.displayName ?? ""}
          onUpdated={(name) => setProfile({ ...profile, displayName: name })}
        />
      </Section>

      <Section title="Conta">
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
      </Section>

      <Section>
        <Link
          to={paths.spaceSettings}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 shadow-xs transition-colors hover:bg-surface-hover"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users2 className="size-4" strokeWidth={1.75} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">Espaço</span>
            <span className="text-xs text-muted-foreground">Nome, participantes, convite e mais.</span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        </Link>
      </Section>

      <Section>
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
