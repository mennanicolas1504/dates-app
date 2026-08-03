import { useNavigate } from "react-router-dom"

import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout"
import { SpaceChoice } from "@/features/onboarding/components/space-choice"
import { paths } from "@/routes/paths"

export function OnboardingWelcomePage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      title="Bem-vindo ao Dates"
      description="Vamos preparar o espaço de vocês dois."
    >
      <SpaceChoice
        onCreateSpace={() => navigate(paths.onboardingCreateSpace)}
        onJoinSpace={() => navigate(paths.onboardingJoinSpace)}
      />
    </OnboardingLayout>
  )
}
