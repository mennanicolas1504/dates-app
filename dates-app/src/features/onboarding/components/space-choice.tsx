import { ChevronRight, Link2, Plus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SpaceChoiceProps {
  onCreateSpace: () => void
  onJoinSpace: () => void
}

export function SpaceChoice({ onCreateSpace, onJoinSpace }: SpaceChoiceProps) {
  return (
    <div className="flex flex-col gap-3">
      <ChoiceCard
        icon={Plus}
        title="Criar um novo espaço"
        description="Comece do zero e convide seu par depois."
        onClick={onCreateSpace}
      />
      <ChoiceCard
        icon={Link2}
        title="Entrar por convite"
        description="Peça para seu parceiro compartilhar o link com você."
        onClick={onJoinSpace}
      />
    </div>
  )
}

interface ChoiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  onClick: () => void
}

function ChoiceCard({ icon: Icon, title, description, onClick }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border px-4 py-4 text-left transition-colors hover:bg-surface-hover"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.75}
      />
    </button>
  )
}
