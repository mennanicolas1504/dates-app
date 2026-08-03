import { useNavigate } from "react-router-dom"

import { JoinSpaceForm } from "@/features/onboarding/components/join-space-form"
import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout"
import { paths } from "@/routes/paths"

export function OnboardingJoinSpacePage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      title="Entrar em um espaço"
      description="Cole o código ou link de convite que você recebeu."
      onBack={() => navigate(paths.onboarding)}
    >
      <JoinSpaceForm />
    </OnboardingLayout>
  )
}
