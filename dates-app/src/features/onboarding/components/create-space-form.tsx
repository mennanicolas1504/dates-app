import * as React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

export function CreateSpaceForm() {
  const { createSpace } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || loading) return

    setLoading(true)
    setError(null)
    const { error: createError } = await createSpace(name.trim())
    setLoading(false)

    if (createError) {
      setError(createError)
      return
    }

    toast.success({ title: "Espaço criado", description: `"${name.trim()}" está pronto.` })
    navigate(paths.home)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="space-name">Nome do espaço</Label>
        <Input
          id="space-name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nosso espaço"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={!name.trim()} loading={loading}>
        Criar espaço
      </Button>
    </form>
  )
}
