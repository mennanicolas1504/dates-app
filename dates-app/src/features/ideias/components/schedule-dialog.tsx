import * as React from "react"
import { CalendarPlus } from "lucide-react"

import { Calendar } from "@/components/common/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Idea } from "@/features/ideias/types"

interface ScheduleDialogProps {
  idea: Idea | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (date: Date) => void
  submitting?: boolean
}

/** Escolher (ou trocar) a data de uma ideia — muda o estado para "Agendada". */
export function ScheduleDialog({
  idea,
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
}: ScheduleDialogProps) {
  const [selected, setSelected] = React.useState<Date | null>(null)

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSelected(idea?.scheduledDate ? new Date(idea.scheduledDate) : null)
    }
  }

  if (!idea) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Agendar</DialogTitle>
          <DialogDescription>Escolha uma data para "{idea.title}".</DialogDescription>
        </DialogHeader>

        <Calendar selected={selected} onSelectDate={setSelected} />

        <DialogFooter>
          <Button variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!selected || submitting}
            loading={submitting}
            onClick={() => selected && onConfirm(selected)}
          >
            <CalendarPlus data-icon="inline-start" />
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
