import { useNavigate } from "react-router-dom"

import { JoinSpaceInfo } from "@/features/onboarding/components/join-space-info"
import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout"
import { paths } from "@/routes/paths"

export function OnboardingJoinSpacePage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      title="Entrar em um espaço"
      description="A entrada acontece automaticamente pelo link de convite."
      onBack={() => navigate(paths.onboarding)}
    >
      <JoinSpaceInfo />
    </OnboardingLayout>
  )
}
