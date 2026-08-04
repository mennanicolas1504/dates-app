import * as React from "react"
import { CalendarCheck, CalendarPlus } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Idea } from "@/features/ideias/types"
import { combineDateAndTime, toTimeInputValue } from "@/lib/date"

const DEFAULT_TIME = "19:00"

interface PlanFormValues {
  date: Date | null
  time: string
  location: string
  notes: string
}

function valuesFromIdea(idea: Idea | null): PlanFormValues {
  const scheduledDate = idea?.scheduledDate ? new Date(idea.scheduledDate) : null
  return {
    date: scheduledDate,
    time: scheduledDate ? toTimeInputValue(scheduledDate) : DEFAULT_TIME,
    location: idea?.location ?? "",
    notes: idea?.notes ?? "",
  }
}

export interface PlanConfirmValues {
  scheduledDate: Date
  location: string
  notes: string
}

interface PlanDialogProps {
  idea: Idea | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: PlanConfirmValues) => void
  submitting?: boolean
}

/**
 * Planejar (ou editar o planejamento de) uma ideia — data, horário, local e
 * observações. `location`/`notes` são os mesmos campos que a Ideia já tem
 * (ver `features/ideias/api.ts`, `planExperience`) — não existe uma
 * entidade "Planejamento" separada, é a mesma Experience, só muda de
 * estágio (`status`).
 */
export function PlanDialog({ idea, open, onOpenChange, onConfirm, submitting = false }: PlanDialogProps) {
  const [values, setValues] = React.useState<PlanFormValues>(() => valuesFromIdea(null))
  const isEditing = idea?.status === "scheduled"

  // Mesmo padrão de reset-no-render já usado em `NewIdeaDialog`.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setValues(valuesFromIdea(idea))
  }

  if (!idea) return null

  function update<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const canSubmit = values.date !== null && !submitting

  function handleConfirm() {
    if (!values.date) return
    onConfirm({
      scheduledDate: combineDateAndTime(values.date, values.time),
      location: values.location.trim(),
      notes: values.notes.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar planejamento" : "Planejar"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Ajuste os detalhes de "${idea.title}".`
              : `Escolha quando "${idea.title}" vai acontecer.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Calendar selected={values.date} onSelectDate={(date) => update("date", date)} />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-time">Horário</Label>
              <Input
                id="plan-time"
                type="time"
                value={values.time}
                onChange={(event) => update("time", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-location">Local</Label>
              <Input
                id="plan-location"
                value={values.location}
                onChange={(event) => update("location", event.target.value)}
                placeholder="Onde vai ser?"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-notes">Observações</Label>
            <Textarea
              id="plan-notes"
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Algo pra lembrar sobre esse dia?"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit} loading={submitting} onClick={handleConfirm}>
            {isEditing ? (
              <CalendarCheck data-icon="inline-start" />
            ) : (
              <CalendarPlus data-icon="inline-start" />
            )}
            {isEditing ? "Salvar alterações" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
