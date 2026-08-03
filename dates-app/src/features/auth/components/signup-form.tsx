import * as React from "react"
import { useNavigate } from "react-router-dom"

import { Typography } from "@/components/common/typography"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/features/auth/components/password-input"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

export function SignupForm() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)

  const passwordsMatch = password === confirmPassword
  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    passwordsMatch

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError(null)
    const result = await signUp(email.trim(), password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.needsEmailConfirmation) {
      setEmailSent(true)
      toast.success({
        title: "Conta criada",
        description: "Confirme seu e-mail para poder entrar.",
      })
      return
    }

    navigate(paths.onboarding)
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <Typography variant="title">Verifique seu e-mail</Typography>
        <Typography variant="body" className="text-muted-foreground">
          Enviamos um link de confirmação para <strong className="text-foreground">{email}</strong>.
        </Typography>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">E-mail</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@exemplo.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-password">Senha</Label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {password.length > 0 && password.length < 6 && (
          <span className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-confirm-password">Confirmar senha</Label>
        <PasswordInput
          id="signup-confirm-password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <span className="text-xs text-danger">As senhas não coincidem.</span>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!canSubmit} loading={loading} className="mt-1">
        Criar conta
      </Button>
    </form>
  )
}
