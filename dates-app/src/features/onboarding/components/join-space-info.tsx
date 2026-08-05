import { Link2 } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"

/**
 * Sem campo de digitação de propósito (ver CLAUDE.md, Fase 12: "não
 * utilizar código manual", "nenhum campo para digitar códigos"). A única
 * forma de entrar num espaço é clicando no link de convite de verdade —
 * que já resgata sozinho ao abrir (ver `features/invites/`), sem passar
 * por esta tela. Isto aqui existe só para quem chega aqui sem ter clicado
 * em nenhum link ainda, como orientação.
 */
export function JoinSpaceInfo() {
  return (
    <EmptyState
      icon={Link2}
      title="Peça o link de convite"
      description="Peça para seu parceiro compartilhar o link de convite com você — ele te leva direto para o espaço, sem precisar digitar nada aqui."
    />
  )
}
