import * as React from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/features/auth/components/password-input"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

export function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const canSubmit = email.trim().length > 0 && password.length > 0

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError(null)
    const { error: signInError } = await signIn(email.trim(), password)
    setLoading(false)

    if (signInError) {
      setError(signInError)
      return
    }

    navigate(paths.home)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@exemplo.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Senha</Label>
          <Link
            to={paths.forgotPassword}
            className="text-xs text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            Esqueci minha senha
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!canSubmit} loading={loading} className="mt-1">
        Entrar
      </Button>
    </form>
  )
}
