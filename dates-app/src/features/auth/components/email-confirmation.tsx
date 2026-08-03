import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CircleAlert, CircleCheck, MailCheck } from "lucide-react"
import type { EmailOtpType } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { Loading } from "@/components/common/loading"
import { Typography } from "@/components/common/typography"
import { supabase } from "@/lib/supabase"
import { paths } from "@/routes/paths"

type Status = "idle" | "loading" | "success" | "error"

const REDIRECT_DELAY_MS = 1500

/**
 * Verifica o token_hash do link de confirmação de e-mail só a partir de um
 * clique explícito do usuário — nunca automaticamente no mount. Apps de
 * e-mail como Gmail/Google no iOS pré-carregam links (WebView completo, com
 * JS) para gerar preview, o que consumiria o token de uso único antes do
 * usuário sequer ver a tela caso a verificação disparasse sozinha.
 */
export function EmailConfirmation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const [status, setStatus] = React.useState<Status>(tokenHash && type ? "idle" : "error")
  const redirectPath = React.useRef<string>(paths.login)

  React.useEffect(() => {
    if (status !== "success") return

    const timeout = setTimeout(() => {
      navigate(redirectPath.current, { replace: true })
    }, REDIRECT_DELAY_MS)

    return () => clearTimeout(timeout)
  }, [status, navigate])

  async function handleConfirm() {
    if (!tokenHash || !type) return

    setStatus("loading")
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (error) {
      setStatus("error")
      return
    }

    redirectPath.current = data.session ? paths.onboarding : paths.login
    setStatus("success")
  }

  if (status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <MailCheck className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="body" className="text-muted-foreground">
          Clique no botão abaixo para confirmar seu e-mail e ativar sua conta.
        </Typography>
        <Button onClick={handleConfirm} className="w-full">
          Confirmar e-mail
        </Button>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <Loading label="Confirmando seu e-mail..." />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <CircleAlert className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="body" className="text-muted-foreground">
          Este link de confirmação é inválido ou já expirou. Tente criar a conta novamente para
          receber um novo e-mail.
        </Typography>
        <Button onClick={() => navigate(paths.signup)} className="w-full">
          Voltar para o cadastro
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <CircleCheck className="size-8 text-muted-foreground" strokeWidth={1.5} />
      <Typography variant="body" className="text-muted-foreground">
        E-mail confirmado com sucesso. Redirecionando...
      </Typography>
    </div>
  )
}
