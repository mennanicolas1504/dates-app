import { Link } from "react-router-dom"

import { AuthLayout } from "@/features/auth/components/auth-layout"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"
import { paths } from "@/routes/paths"

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar senha"
      description="Informe seu e-mail para receber o link de redefinição."
      footer={
        <Link
          to={paths.login}
          className="font-medium text-brand underline underline-offset-2 hover:text-brand-hover"
        >
          Voltar para o login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
