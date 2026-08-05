import { Navigate, useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InviteLinkCard } from "@/features/invites/components/invite-link-card"
import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

/**
 * Passo de revelar o convite, numa rota própria fora do
 * `RequireOnboardingIncomplete` — ver `routes/paths.ts` para o motivo.
 * Só acessível de fato logo após criar um espaço (o link chega junto,
 * automaticamente); acessar direto sem ter espaço cai de volta pro início.
 */
export function OnboardingShareInvitePage() {
  const navigate = useNavigate()
  const { space, user } = useAuth()

  if (!space || !user) {
    return <Navigate to={paths.onboarding} replace />
  }

  return (
    <OnboardingLayout
      title="Convide seu par"
      description="Envie este link para ele(a) entrar automaticamente no espaço."
    >
      <div className="flex flex-col gap-4">
        <InviteLinkCard spaceId={space.id} createdById={user.id} />
        <Button
          onClick={() => navigate(paths.home)}
          variant="ghost"
          className="w-fit self-center text-muted-foreground"
        >
          Continuar sem convidar agora
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </OnboardingLayout>
  )
}
