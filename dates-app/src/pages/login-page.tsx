import { Link } from "react-router-dom"

import { AuthLayout } from "@/features/auth/components/auth-layout"
import { LoginForm } from "@/features/auth/components/login-form"
import { paths } from "@/routes/paths"

export function LoginPage() {
  return (
    <AuthLayout
      title="Entrar"
      footer={
        <>
          Ainda não tem uma conta?{" "}
          <Link
            to={paths.signup}
            className="font-medium text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
