import { useNavigate } from "react-router-dom"

import { CreateSpaceForm } from "@/features/onboarding/components/create-space-form"
import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout"
import { paths } from "@/routes/paths"

export function OnboardingCreateSpacePage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      title="Nome do espaço"
      description='Exemplos: "Nicolas & Melissa", "Nosso espaço", "Our Dates".'
      onBack={() => navigate(paths.onboarding)}
    >
      <CreateSpaceForm />
    </OnboardingLayout>
  )
}
