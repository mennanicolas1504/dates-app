import { useNavigate } from "react-router-dom"

import { InviteRedeemer } from "@/features/invites/components/invite-redeemer"
import { getPendingInviteToken } from "@/features/invites/pending-invite"
import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout"
import { SpaceChoice } from "@/features/onboarding/components/space-choice"
import { paths } from "@/routes/paths"

export function OnboardingWelcomePage() {
  const navigate = useNavigate()

  // Se o usuário chegou aqui vindo de um link de convite (guardado antes do
  // cadastro/login — ver `pending-invite.ts`), resgata sozinho, sem exigir
  // nenhuma escolha manual. Mesmo componente que `/convite/:token` usa —
  // não duplica a lógica de redenção.
  const pendingToken = getPendingInviteToken()
  if (pendingToken) {
    return (
      <OnboardingLayout title="Entrando no espaço" description="Só um instante...">
        <InviteRedeemer token={pendingToken} />
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      title="Bem-vindo ao Dates ON"
      description="Vamos preparar o espaço de vocês dois."
    >
      <SpaceChoice
        onCreateSpace={() => navigate(paths.onboardingCreateSpace)}
        onJoinSpace={() => navigate(paths.onboardingJoinSpace)}
      />
    </OnboardingLayout>
  )
}
