import * as React from "react"
import { Check, Copy, RefreshCw, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Typography } from "@/components/common/typography"
import { buildInviteUrl } from "@/features/invites/build-invite-url"
import { getOrCreateActiveInvite, regenerateSpaceInvite } from "@/features/invites/api"
import { toast } from "@/hooks/use-toast"

interface InviteLinkCardProps {
  spaceId: string
  createdById: string
  className?: string
}

/**
 * Gera (ou reaproveita, se já existir um ativo — ver `getOrCreateActiveInvite`)
 * o link de convite do espaço, com copiar/compartilhar. Usado tanto ao criar
 * o espaço quanto em Configurações — mesmo componente, sem duplicar lógica.
 */
export function InviteLinkCard({ spaceId, createdById, className }: InviteLinkCardProps) {
  const [url, setUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = React.useState(false)
  const [regenerating, setRegenerating] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    getOrCreateActiveInvite(spaceId, createdById).then(({ invite, error: inviteError }) => {
      if (cancelled) return
      if (inviteError || !invite) {
        setError(inviteError ?? "Não foi possível gerar o link de convite.")
      } else {
        setUrl(buildInviteUrl(invite.token))
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [spaceId, createdById])

  async function handleRegenerate() {
    setRegenerating(true)
    const { invite, error: regenerateError } = await regenerateSpaceInvite(spaceId, createdById)
    setRegenerating(false)
    setConfirmRegenerate(false)

    if (regenerateError || !invite) {
      toast.error({
        title: "Não foi possível gerar um novo link",
        description: regenerateError ?? undefined,
      })
      return
    }

    setUrl(buildInviteUrl(invite.token))
    setError(null)
    toast.success({ title: "Novo link gerado", description: "O link anterior não funciona mais." })
  }

  async function handleCopy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success({ title: "Link copiado" })
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (!url) return
    if (navigator.share) {
      try {
        await navigator.share({ title: "Convite para o Dates", url })
      } catch {
        // Usuário cancelou o compartilhamento — não é um erro a reportar.
      }
      return
    }
    handleCopy()
  }

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !url) {
    return (
      <Typography variant="body" className={className}>
        {error ?? "Não foi possível gerar o link de convite."}
      </Typography>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{url}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
          {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
          {copied ? "Copiado" : "Copiar link"}
        </Button>
        <Button size="sm" onClick={handleShare} className="flex-1">
          <Share2 data-icon="inline-start" />
          Compartilhar
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmRegenerate(true)}
        className="mt-1 text-muted-foreground"
      >
        <RefreshCw data-icon="inline-start" />
        Gerar novo link
      </Button>

      <ConfirmDialog
        open={confirmRegenerate}
        onOpenChange={(open) => !regenerating && setConfirmRegenerate(open)}
        title="Gerar novo link de convite"
        description="O link atual para de funcionar imediatamente. Use isso se acha que ele foi compartilhado com a pessoa errada."
        icon={RefreshCw}
        confirmLabel="Gerar novo link"
        onConfirm={handleRegenerate}
        loading={regenerating}
      />
    </div>
  )
}
