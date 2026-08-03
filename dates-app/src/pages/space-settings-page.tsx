import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { Typography } from "@/components/common/typography"
import { SpaceNameForm } from "@/features/space/components/space-name-form"

export function SpaceSettingsPage() {
  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <PageTitle>Espaço</PageTitle>
        <Typography variant="subtitle">Configurações do espaço compartilhado.</Typography>
      </div>

      <SpaceNameForm />
    </PageContainer>
  )
}
