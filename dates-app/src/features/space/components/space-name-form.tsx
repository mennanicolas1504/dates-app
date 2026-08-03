import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"

/**
 * Único campo editável do Espaço nesta fase: o nome. Foto, capa e
 * descrição ficam para depois (ver ROADMAP.md / CLAUDE.md).
 */
export function SpaceNameForm() {
  const { space, updateSpaceName } = useAuth()
  const [name, setName] = React.useState(space?.name ?? "")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const trimmed = name.trim()
  const isDirty = trimmed !== (space?.name ?? "")
  const canSubmit = trimmed.length > 0 && isDirty

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setError(null)
    const { error: updateError } = await updateSpaceName(trimmed)
    setLoading(false)

    if (updateError) {
      setError(updateError)
      return
    }

    toast.success({ title: "Nome do espaço atualizado" })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="space-settings-name">Nome do espaço</Label>
        <Input
          id="space-settings-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nosso espaço"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!canSubmit} loading={loading} className="w-fit">
        Salvar
      </Button>
    </form>
  )
}
