import * as React from "react"

import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { Section } from "@/components/common/section"
import { SkeletonList } from "@/components/common/skeletons"
import { Typography } from "@/components/common/typography"
import { InviteLinkCard } from "@/features/invites/components/invite-link-card"
import { fetchSpaceMembers } from "@/features/space/api"
import { SpaceManagementSection } from "@/features/space/components/space-management-section"
import { SpaceMembersList } from "@/features/space/components/space-members-list"
import { SpaceNameForm } from "@/features/space/components/space-name-form"
import type { SpaceMember } from "@/features/space/types"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"

export function SpaceSettingsPage() {
  const { space, user, refreshSpace } = useAuth()

  const [members, setMembers] = React.useState<SpaceMember[]>([])
  const [loadingMembers, setLoadingMembers] = React.useState(true)
  const [loadedSpaceId, setLoadedSpaceId] = React.useState<string | null>(null)

  const spaceId = space?.id ?? null
  if (spaceId !== loadedSpaceId) {
    setLoadedSpaceId(spaceId)
    setMembers([])
    setLoadingMembers(spaceId !== null)
  }

  // Só o `.then()` mexe em estado — a chamada em si, dentro do efeito, não
  // é uma setState síncrona (mesmo padrão de `IdeiasPage`/`AlbumPage`). O
  // "loading" inicial já vem do sentinel acima; `handleTransferred` (fora
  // de efeito, num handler de clique) liga `loadingMembers` de novo antes
  // de chamar isto, para o refresh pós-transferência também mostrar skeleton.
  const loadMembers = React.useCallback((id: string) => {
    fetchSpaceMembers(id).then(({ members: fetched, error }) => {
      if (error) {
        toast.error({ title: "Não foi possível carregar os participantes", description: error })
        setLoadingMembers(false)
        return
      }
      setMembers(fetched)
      setLoadingMembers(false)
    })
  }, [])

  React.useEffect(() => {
    if (space) loadMembers(space.id)
  }, [space, loadMembers])

  async function handleTransferred() {
    await refreshSpace()
    if (space) {
      setLoadingMembers(true)
      loadMembers(space.id)
    }
  }

  if (!space || !user) return null

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle>Espaço</PageTitle>
        <Typography variant="subtitle">Configurações do espaço compartilhado.</Typography>
      </div>

      <Section title="Nome">
        <SpaceNameForm />
      </Section>

      <Section title="Participantes">
        {loadingMembers ? <SkeletonList rows={2} /> : <SpaceMembersList members={members} currentUserId={user.id} />}
      </Section>

      <Section title="Convidar parceiro" description="Compartilhe este link para ele(a) entrar automaticamente.">
        <InviteLinkCard spaceId={space.id} createdById={user.id} />
      </Section>

      <Section title="Gerenciamento">
        <SpaceManagementSection
          space={space}
          members={members}
          currentUserId={user.id}
          onLeftOrDeleted={() => void refreshSpace()}
          onTransferred={handleTransferred}
        />
      </Section>
    </PageContainer>
  )
}
