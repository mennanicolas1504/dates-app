import * as React from "react"
import { ArrowRightLeft, LogOut, Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/common/typography"
import { deleteSpace, leaveSpace, transferSpaceOwnership } from "@/features/space/api"
import type { Space, SpaceMember } from "@/features/space/types"
import { toast } from "@/hooks/use-toast"

interface SpaceManagementSectionProps {
  space: Space
  members: SpaceMember[]
  currentUserId: string
  /** Espaço saiu de baixo do usuário (saída ou exclusão) — a página não tem mais nada pra mostrar. */
  onLeftOrDeleted: () => void
  onTransferred: () => void
}

type ActiveDialog = "leave" | "transfer" | "delete" | null

/**
 * Um espaço tem no máximo duas pessoas (ver CLAUDE.md, "Filosofia") e
 * sempre precisa de um dono — por isso as opções mudam com o papel de quem
 * está vendo, não são três botões soltos:
 *
 * - Membro (não-dono): só "Sair do espaço" — o espaço continua existindo
 *   para quem ficou.
 * - Dono sozinho: só "Excluir espaço" — sair sozinho deixaria o espaço
 *   órfão (dono sem membership, ninguém mais consegue enxergá-lo via RLS),
 *   então nem é oferecido como ação separada.
 * - Dono com parceiro: "Transferir propriedade" (pro parceiro, o único
 *   outro membro possível — sem seletor) ou "Excluir espaço". Sair direto
 *   fica de fora: deixaria `spaces.owner_id` apontando pra alguém que não é
 *   mais membro, um estado que a RLS não impede mas que não faz sentido.
 */
export function SpaceManagementSection({
  space,
  members,
  currentUserId,
  onLeftOrDeleted,
  onTransferred,
}: SpaceManagementSectionProps) {
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const isOwner = space.ownerId === currentUserId
  const partner = members.find((member) => member.profileId !== currentUserId) ?? null

  function closeDialog() {
    if (submitting) return
    setActiveDialog(null)
  }

  async function handleLeave() {
    setSubmitting(true)
    const { error } = await leaveSpace(space.id, currentUserId)
    setSubmitting(false)

    if (error) {
      toast.error({ title: "Não foi possível sair do espaço", description: error })
      return
    }

    setActiveDialog(null)
    toast.success({ title: "Você saiu do espaço" })
    onLeftOrDeleted()
  }

  async function handleDelete() {
    setSubmitting(true)
    const { error } = await deleteSpace(space.id)
    setSubmitting(false)

    if (error) {
      toast.error({ title: "Não foi possível excluir o espaço", description: error })
      return
    }

    setActiveDialog(null)
    toast.success({ title: "Espaço excluído" })
    onLeftOrDeleted()
  }

  async function handleTransfer() {
    if (!partner) return

    setSubmitting(true)
    const { error } = await transferSpaceOwnership(space.id, partner.profileId)
    setSubmitting(false)

    if (error) {
      toast.error({ title: "Não foi possível transferir a propriedade", description: error })
      return
    }

    setActiveDialog(null)
    toast.success({ title: `Propriedade transferida para ${partner.displayName}` })
    onTransferred()
  }

  return (
    <div className="flex flex-col gap-3">
      {!isOwner && (
        <ActionRow
          icon={LogOut}
          label="Sair do espaço"
          description="Você deixa de ver o conteúdo deste espaço. Ele continua existindo para quem ficar."
          buttonLabel="Sair"
          onClick={() => setActiveDialog("leave")}
        />
      )}

      {isOwner && partner && (
        <ActionRow
          icon={ArrowRightLeft}
          label="Transferir propriedade"
          description={`Torna ${partner.displayName} dono(a) do espaço. Você continua como membro.`}
          buttonLabel="Transferir"
          onClick={() => setActiveDialog("transfer")}
        />
      )}

      {isOwner && !partner && (
        <Typography variant="caption">
          Você é o único participante deste espaço — para sair, exclua o espaço abaixo.
        </Typography>
      )}

      {isOwner && (
        <ActionRow
          icon={Trash2}
          label="Excluir espaço"
          description="Apaga permanentemente o espaço, as experiências e as fotos de todos os participantes."
          buttonLabel="Excluir"
          variant="destructive"
          onClick={() => setActiveDialog("delete")}
        />
      )}

      <ConfirmDialog
        open={activeDialog === "leave"}
        onOpenChange={closeDialog}
        title="Sair do espaço"
        description="Você pode entrar de novo depois, se receber um novo convite."
        icon={LogOut}
        confirmLabel="Sair"
        onConfirm={handleLeave}
        loading={submitting}
      />

      <ConfirmDialog
        open={activeDialog === "transfer"}
        onOpenChange={closeDialog}
        title="Transferir propriedade"
        description={partner ? `${partner.displayName} passa a ser o(a) dono(a) deste espaço.` : undefined}
        icon={ArrowRightLeft}
        confirmLabel="Transferir"
        onConfirm={handleTransfer}
        loading={submitting}
      />

      <ConfirmDialog
        open={activeDialog === "delete"}
        onOpenChange={closeDialog}
        title="Excluir espaço"
        description="Esta ação não pode ser desfeita. Todas as ideias, experiências e fotos serão perdidas para sempre."
        icon={Trash2}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
        loading={submitting}
      />
    </div>
  )
}

interface ActionRowProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  description: string
  buttonLabel: string
  variant?: "default" | "destructive"
  onClick: () => void
}

function ActionRow({ icon: Icon, label, description, buttonLabel, variant = "default", onClick }: ActionRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <Button variant={variant === "destructive" ? "destructive" : "outline"} size="sm" onClick={onClick}>
        {buttonLabel}
      </Button>
    </div>
  )
}
