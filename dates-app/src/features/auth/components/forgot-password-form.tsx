import * as React from "react"

import { Typography } from "@/components/common/typography"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/providers/auth-provider"

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth()

  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError(null)
    const { error: resetError } = await requestPasswordReset(email.trim())
    setLoading(false)

    if (resetError) {
      setError(resetError)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <Typography variant="title">Verifique seu e-mail</Typography>
        <Typography variant="body" className="text-muted-foreground">
          Se <strong className="text-foreground">{email}</strong> tiver uma conta, enviamos um
          link para redefinir a senha.
        </Typography>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-email">E-mail</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@exemplo.com"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!email.trim()} loading={loading} className="mt-1">
        Enviar link de recuperação
      </Button>
    </form>
  )
}
