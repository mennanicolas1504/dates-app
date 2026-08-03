import * as React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/features/auth/components/password-input"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

export function ResetPasswordForm() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const passwordsMatch = password === confirmPassword
  const canSubmit = password.length >= 6 && confirmPassword.length > 0 && passwordsMatch

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError(null)
    const { error: updateError } = await updatePassword(password)
    setLoading(false)

    if (updateError) {
      setError(updateError)
      return
    }

    toast.success({ title: "Senha atualizada" })
    navigate(paths.home)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password">Nova senha</Label>
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {password.length > 0 && password.length < 6 && (
          <span className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password-confirm">Confirmar nova senha</Label>
        <PasswordInput
          id="reset-password-confirm"
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
        Salvar nova senha
      </Button>
    </form>
  )
}
