import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { Section } from "@/components/common/section"
import { Typography } from "@/components/common/typography"
import { InviteLinkCard } from "@/features/invites/components/invite-link-card"
import { SpaceNameForm } from "@/features/space/components/space-name-form"
import { useAuth } from "@/providers/auth-provider"

export function SpaceSettingsPage() {
  const { space, user } = useAuth()

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle>Espaço</PageTitle>
        <Typography variant="subtitle">Configurações do espaço compartilhado.</Typography>
      </div>

      <Section title="Nome">
        <SpaceNameForm />
      </Section>

      {space && user && (
        <Section title="Convidar parceiro" description="Compartilhe este link para ele(a) entrar automaticamente.">
          <InviteLinkCard spaceId={space.id} createdById={user.id} />
        </Section>
      )}
    </PageContainer>
  )
}
