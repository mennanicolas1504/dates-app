import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

/**
 * A experiência está pronta, mas a validação real do convite ainda não
 * existe (depende da tabela de convites — próxima fase). Por isso o envio
 * só confirma que o campo foi preenchido e avisa honestamente que a
 * funcionalidade chega em breve, em vez de fingir sucesso.
 */
export function JoinSpaceForm() {
  const [value, setValue] = React.useState("")

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!value.trim()) return

    toast.info({
      title: "Convites ainda não estão disponíveis",
      description: "Essa funcionalidade chega em breve.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-code">Código ou link de convite</Label>
        <Input
          id="invite-code"
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Cole o código ou link aqui"
        />
      </div>

      <Button type="submit" disabled={!value.trim()}>
        Entrar no espaço
      </Button>
    </form>
  )
}
