import * as React from "react"
import { useNavigate } from "react-router-dom"
import { CircleAlert, CircleCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loading } from "@/components/common/loading"
import { Typography } from "@/components/common/typography"
import { redeemSpaceInvite } from "@/features/invites/api"
import { clearPendingInviteToken, setPendingInviteToken } from "@/features/invites/pending-invite"
import { paths } from "@/routes/paths"
import { useAuth } from "@/providers/auth-provider"

const REDIRECT_DELAY_MS = 1200

interface InviteRedeemerProps {
  token: string
}

type RedeemResult = { status: "done" } | { status: "error"; message: string }

/**
 * Só decide o que mostrar; quem redime de fato é `redeemSpaceInvite` (RPC
 * `redeem_space_invite`, ver `013_space_invites.sql`) — nenhuma lógica de
 * validação de convite vive aqui. Não precisa do gate de clique que
 * `EmailConfirmation` usa contra pré-carregamento de link: redimir exige
 * uma sessão autenticada além do token (dois fatores), então um scanner de
 * link anônimo (WhatsApp, iMessage...) nunca consegue consumir o convite
 * sozinho — só o dono do link, já logado, consegue.
 */
export function InviteRedeemer({ token }: InviteRedeemerProps) {
  const navigate = useNavigate()
  const { user, space, loading: authLoading, refreshSpace } = useAuth()

  const [result, setResult] = React.useState<RedeemResult | null>(null)
  const firedRef = React.useRef(false)

  // Guarda o token assim que a página monta — sobrevive ao cadastro/login
  // mesmo que o usuário ainda não tenha conta (ver `pending-invite.ts`).
  React.useEffect(() => {
    setPendingInviteToken(token)
  }, [token])

  const alreadyMember = !authLoading && Boolean(user) && Boolean(space)
  const shouldRedeem = !authLoading && Boolean(user) && !space

  React.useEffect(() => {
    if (!shouldRedeem || firedRef.current) return
    firedRef.current = true

    redeemSpaceInvite(token).then(async ({ error }) => {
      if (error) {
        clearPendingInviteToken()
        setResult({ status: "error", message: error })
        return
      }

      await refreshSpace()
      clearPendingInviteToken()
      setResult({ status: "done" })
    })
  }, [shouldRedeem, token, refreshSpace])

  React.useEffect(() => {
    if (!alreadyMember && result?.status !== "done") return

    if (alreadyMember) clearPendingInviteToken()

    const timeout = setTimeout(() => navigate(paths.home, { replace: true }), REDIRECT_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [alreadyMember, result, navigate])

  if (authLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <Loading label="Carregando..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <Users className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="body" className="text-muted-foreground">
          Você recebeu um convite para participar de um espaço no Dates ON. Crie sua conta ou entre
          para continuar.
        </Typography>
        <div className="flex w-full flex-col gap-2">
          <Button onClick={() => navigate(paths.signup)} className="w-full">
            Criar conta
          </Button>
          <Button variant="outline" onClick={() => navigate(paths.login)} className="w-full">
            Já tenho conta
          </Button>
        </div>
      </div>
    )
  }

  if (alreadyMember) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <CircleCheck className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="body" className="text-muted-foreground">
          Você já faz parte de um espaço.
        </Typography>
      </div>
    )
  }

  if (result?.status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <CircleAlert className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="body" className="text-muted-foreground">
          {result.message}
        </Typography>
        <Button onClick={() => navigate(paths.onboarding)} className="w-full">
          Continuar
        </Button>
      </div>
    )
  }

  if (result?.status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <CircleCheck className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="body" className="text-muted-foreground">
          Você entrou no espaço!
        </Typography>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <Loading label="Entrando no espaço..." />
    </div>
  )
}
