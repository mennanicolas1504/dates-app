import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfileName } from "@/features/profile/api"
import { toast } from "@/hooks/use-toast"

interface ProfileNameFormProps {
  userId: string
  initialName: string
  onUpdated: (name: string) => void
}

/** Mesmo padrão de `SpaceNameForm` — único campo editável, salvar inline. */
export function ProfileNameForm({ userId, initialName, onUpdated }: ProfileNameFormProps) {
  const [name, setName] = React.useState(initialName)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const trimmed = name.trim()
  const isDirty = trimmed !== initialName
  const canSubmit = trimmed.length > 0 && isDirty

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError(null)
    const { error: updateError } = await updateProfileName(userId, trimmed)
    setLoading(false)

    if (updateError) {
      setError(updateError)
      return
    }

    onUpdated(trimmed)
    toast.success({ title: "Nome atualizado" })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">Seu nome</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Como você quer ser chamado(a)"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!canSubmit} loading={loading} className="w-fit">
        Salvar
      </Button>
    </form>
  )
}
