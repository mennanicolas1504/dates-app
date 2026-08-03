import { Link } from "react-router-dom"

import { AuthLayout } from "@/features/auth/components/auth-layout"
import { SignupForm } from "@/features/auth/components/signup-form"
import { paths } from "@/routes/paths"

export function SignupPage() {
  return (
    <AuthLayout
      title="Criar conta"
      footer={
        <>
          Já tem uma conta?{" "}
          <Link
            to={paths.login}
            className="font-medium text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            Entrar
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  )
}
