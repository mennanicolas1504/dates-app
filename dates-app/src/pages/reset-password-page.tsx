import { AuthLayout } from "@/features/auth/components/auth-layout"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"

export function ResetPasswordPage() {
  return (
    <AuthLayout title="Redefinir senha" description="Escolha uma nova senha para sua conta.">
      <ResetPasswordForm />
    </AuthLayout>
  )
}
