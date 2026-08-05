import { useNavigate } from "react-router-dom"

import { NotFoundState } from "@/components/common/not-found-state"
import { paths } from "@/routes/paths"

/** Rota catch-all (`*`) — qualquer endereço que não bate com nenhuma rota real. */
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <NotFoundState action={{ label: "Voltar para o início", onClick: () => navigate(paths.home) }} />
  )
}
