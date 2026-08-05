import * as React from "react"
import { Check, CircleCheck } from "lucide-react"

import { Calendar } from "@/components/common/calendar"
import { MediaDropzone } from "@/components/common/media/media-dropzone"
import { MediaPreviewGrid } from "@/components/common/media/media-preview-grid"
import { Rating } from "@/components/common/rating"
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
import { useMediaUpload } from "@/hooks/use-media-upload"
import { combineDateAndTime, toTimeInputValue } from "@/lib/date"
import { deleteMedia, reorderMedia } from "@/lib/media/api"
import { constraintsFor } from "@/lib/media/constraints"
import type { MediaRecord } from "@/lib/media/types"

const EXPERIENCE_MEDIA_CONSTRAINTS = constraintsFor("experience")

interface CompleteFormValues {
  date: Date | null
  time: string
  rating: number
  notes: string
  actualCost: string
}

function valuesFromIdea(idea: Idea | null): CompleteFormValues {
  const reference = idea?.completedAt
    ? new Date(idea.completedAt)
    : idea?.scheduledDate
      ? new Date(idea.scheduledDate)
      : new Date()

  return {
    date: reference,
    time: toTimeInputValue(reference),
    rating: idea?.rating ?? 0,
    notes: idea?.notes ?? "",
    actualCost: idea?.actualCost !== undefined ? String(idea.actualCost) : "",
  }
}

export interface CompleteConfirmValues {
  completedAt: Date
  rating: number
  notes: string
  actualCost: number | null
}

interface CompleteExperienceDialogProps {
  idea: Idea | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: CompleteConfirmValues) => void
  submitting?: boolean
  spaceId: string
  createdById: string
  /** Fotos da fase "vivida" (`kind: "experience"`) — coleção separada das fotos da Ideia. */
  media: MediaRecord[]
  onMediaUploaded: (media: MediaRecord) => void
  onMediaRemoved: (mediaId: string) => void
  onMediaReordered: (updates: { id: string; position: number }[]) => void
}

/**
 * Registrar (ou editar) a memória de uma experiência vivida — quando
 * aconteceu de fato, avaliação, observações finais, custo real e as fotos
 * de verdade (não as de inspiração da Ideia — ver `kind: "experience"` no
 * Sistema de Mídia). Mesma operação para concluir pela primeira vez ou
 * editar depois (`completeExperience`, um único `update`).
 */
export function CompleteExperienceDialog({
  idea,
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
  spaceId,
  createdById,
  media,
  onMediaUploaded,
  onMediaRemoved,
  onMediaReordered,
}: CompleteExperienceDialogProps) {
  const [values, setValues] = React.useState<CompleteFormValues>(() => valuesFromIdea(null))
  const isEditing = idea?.status === "completed"

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setValues(valuesFromIdea(idea))
  }

  const { items: uploadItems, addFiles, retry, remove } = useMediaUpload({
    kind: "experience",
    spaceId,
    resourceId: idea?.id ?? "",
    createdById,
    existingCount: media.length,
    onUploaded: onMediaUploaded,
  })

  async function handleRemoveMedia(item: MediaRecord) {
    await deleteMedia(item)
    onMediaRemoved(item.id)
  }

  async function handleReorderMedia(updates: { id: string; position: number }[]) {
    await reorderMedia(updates)
    onMediaReordered(updates)
  }

  if (!idea) return null

  function update<K extends keyof CompleteFormValues>(key: K, value: CompleteFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const canSubmit = values.date !== null && !submitting

  function handleConfirm() {
    if (!values.date) return
    const parsedCost = values.actualCost.trim() ? Number(values.actualCost) : null

    onConfirm({
      completedAt: combineDateAndTime(values.date, values.time),
      rating: values.rating,
      notes: values.notes.trim(),
      actualCost: parsedCost !== null && !Number.isNaN(parsedCost) ? parsedCost : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar memória" : "Marcar como vivida"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Ajuste os detalhes de "${idea.title}".`
              : `Registre como "${idea.title}" aconteceu de verdade.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Calendar selected={values.date} onSelectDate={(date) => update("date", date)} />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="complete-time">Horário</Label>
                <Input
                  id="complete-time"
                  type="time"
                  value={values.time}
                  onChange={(event) => update("time", event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="complete-cost">Custo real</Label>
                <Input
                  id="complete-cost"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="R$ (opcional)"
                  value={values.actualCost}
                  onChange={(event) => update("actualCost", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Avaliação</Label>
            <Rating value={values.rating} onChange={(next) => update("rating", next)} size="lg" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="complete-notes">Observações finais</Label>
            <Textarea
              id="complete-notes"
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Como foi? O que vale lembrar?"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Fotos da experiência</Label>
            <MediaDropzone
              multiple
              accept={EXPERIENCE_MEDIA_CONSTRAINTS.allowedMimeTypes.join(",")}
              disabled={
                EXPERIENCE_MEDIA_CONSTRAINTS.maxCount !== null &&
                media.length + uploadItems.length >= EXPERIENCE_MEDIA_CONSTRAINTS.maxCount
              }
              onFilesSelected={addFiles}
              label="Adicionar fotos"
              hint={`Até ${EXPERIENCE_MEDIA_CONSTRAINTS.maxCount} fotos`}
            />
            <MediaPreviewGrid
              media={media}
              uploadItems={uploadItems}
              onRemoveMedia={handleRemoveMedia}
              onRemoveUploadItem={remove}
              onRetryUploadItem={retry}
              onReorder={handleReorderMedia}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit} loading={submitting} onClick={handleConfirm}>
            {isEditing ? <Check data-icon="inline-start" /> : <CircleCheck data-icon="inline-start" />}
            {isEditing ? "Salvar alterações" : "Marcar como vivida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
