import { paths } from "@/routes/paths"

/** `paths.invite` guarda o padrão de rota (`/convite/:token`) para o router; isto monta a URL real e absoluta para compartilhar. */
export function buildInviteUrl(token: string): string {
  const path = paths.invite.replace(":token", token)
  return `${window.location.origin}${path}`
}
