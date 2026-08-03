import { AuthLayout } from "@/features/auth/components/auth-layout"
import { EmailConfirmation } from "@/features/auth/components/email-confirmation"

export function AuthConfirmPage() {
  return (
    <AuthLayout title="Confirmar e-mail">
      <EmailConfirmation />
    </AuthLayout>
  )
}
