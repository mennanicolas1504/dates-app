import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Plus } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MediaDropzone } from "@/components/common/media/media-dropzone"
import { MediaPreviewGrid } from "@/components/common/media/media-preview-grid"
import { IDEA_CATEGORIES } from "@/features/ideias/data/categories"
import type { NewIdeaFormValues } from "@/features/ideias/types"
import { useMediaUpload } from "@/hooks/use-media-upload"
import { deleteMedia, reorderMedia } from "@/lib/media/api"
import { constraintsFor } from "@/lib/media/constraints"
import type { MediaRecord } from "@/lib/media/types"
import { transition } from "@/lib/motion"
import { cn } from "@/lib/utils"

const IDEA_MEDIA_CONSTRAINTS = constraintsFor("idea")

const EMPTY_VALUES: NewIdeaFormValues = {
  title: "",
  category: "",
  description: "",
  location: "",
  instagram: "",
  website: "",
  link: "",
  city: "",
  notes: "",
}

interface NewIdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pré-preenchimento (ex.: vindo de uma sugestão, ou os dados atuais ao editar). */
  initialValues?: Partial<NewIdeaFormValues>
  onSubmit: (values: NewIdeaFormValues) => void
  /** "edit" reaproveita o mesmo formulário para alterar uma ideia existente. */
  mode?: "create" | "edit"
  /** true enquanto o submit está em voo — desabilita o form e mostra loading no botão. */
  submitting?: boolean
  spaceId: string
  createdById: string
  /**
   * Id da própria ideia — dono das fotos no Sistema de Mídia (`kind: "idea"`).
   * `null` só na criação, antes do primeiro "Criar ideia" bem-sucedido: sem
   * um id persistido ainda não há onde anexar fotos (ver `IdeiasPage`, que
   * troca isto por um id real assim que a criação termina, sem fechar o
   * diálogo — é o que libera a seção de fotos no meio da mesma sessão).
   */
  resourceId: string | null
  /** Fotos já persistidas desta ideia. */
  media: MediaRecord[]
  onMediaUploaded: (media: MediaRecord) => void
  onMediaRemoved: (mediaId: string) => void
  onMediaReordered: (updates: { id: string; position: number }[]) => void
}

function hasExtraDetails(values: NewIdeaFormValues): boolean {
  return Boolean(
    values.description ||
      values.location ||
      values.instagram ||
      values.website ||
      values.link ||
      values.city ||
      values.notes,
  )
}

/**
 * Modal de criação — só título e categoria são obrigatórios. Todo o resto
 * fica atrás de "Adicionar mais detalhes", fechado por padrão, porque cada
 * casal decide quanto detalhe quer registrar (ver CLAUDE.md, filosofia de
 * simplicidade, e o pedido explícito de nunca exigir informação desnecessária).
 */
export function NewIdeaDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  mode = "create",
  submitting = false,
  spaceId,
  createdById,
  resourceId,
  media,
  onMediaUploaded,
  onMediaRemoved,
  onMediaReordered,
}: NewIdeaDialogProps) {
  const [values, setValues] = React.useState<NewIdeaFormValues>(EMPTY_VALUES)
  const [showMore, setShowMore] = React.useState(false)

  // Reseta o formulário sempre que o diálogo abre. Ajuste de estado durante
  // a renderização (guardado pela comparação com o render anterior), não
  // dentro de um efeito — é o padrão recomendado pelo React para isto.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      const next = { ...EMPTY_VALUES, ...initialValues }
      setValues(next)
      setShowMore(hasExtraDetails(next))
    }
  }

  const canSubmit = values.title.trim().length > 0 && values.category.length > 0 && !submitting

  function update<K extends keyof NewIdeaFormValues>(key: K, value: NewIdeaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  // Upload é imediato (não fica atrás do botão "Salvar") — cada foto some
  // da fila do hook assim que persiste (ver `use-media-upload.ts`) e passa
  // a viver em `media`, que a página mantém. `resourceId` só é real depois
  // da ideia já existir; até lá o dropzone fica desabilitado (ver abaixo).
  const { items: uploadItems, addFiles, retry, remove } = useMediaUpload({
    kind: "idea",
    spaceId,
    resourceId: resourceId ?? "",
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

  // Não fecha o diálogo aqui: quem decide é a página, depois que a chamada
  // ao Supabase resolver — se der erro, o diálogo continua aberto (com os
  // valores preenchidos) para o usuário tentar de novo.
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Editar ideia" : "Nova ideia"}</DialogTitle>
            <DialogDescription>
              Só título e categoria são obrigatórios — o resto fica pra quando você quiser.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="idea-title">Título</Label>
              <Input
                id="idea-title"
                autoFocus
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Ex.: Jantar no Outback"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="idea-category">Categoria</Label>
              <Select
                value={values.category}
                onValueChange={(value) => update("category", value)}
              >
                <SelectTrigger id="idea-category" className="w-full">
                  <SelectValue placeholder="Escolher categoria" />
                </SelectTrigger>
                <SelectContent>
                  {IDEA_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Fotos</Label>
            {resourceId ? (
              <>
                <MediaDropzone
                  multiple
                  accept={IDEA_MEDIA_CONSTRAINTS.allowedMimeTypes.join(",")}
                  disabled={
                    IDEA_MEDIA_CONSTRAINTS.maxCount !== null &&
                    media.length + uploadItems.length >= IDEA_MEDIA_CONSTRAINTS.maxCount
                  }
                  onFilesSelected={addFiles}
                  label="Adicionar fotos"
                  hint={`Até ${IDEA_MEDIA_CONSTRAINTS.maxCount} fotos`}
                />
                <MediaPreviewGrid
                  media={media}
                  uploadItems={uploadItems}
                  onRemoveMedia={handleRemoveMedia}
                  onRemoveUploadItem={remove}
                  onRetryUploadItem={retry}
                  onReorder={handleReorderMedia}
                />
              </>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                Salve a ideia primeiro para adicionar fotos.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-mx-2 w-fit text-muted-foreground"
            onClick={() => setShowMore((prev) => !prev)}
          >
            <ChevronDown
              data-icon="inline-start"
              className={cn("transition-transform duration-150", showMore && "rotate-180")}
            />
            {showMore ? "Ocultar detalhes" : "Adicionar mais detalhes"}
          </Button>

          <AnimatePresence initial={false}>
            {showMore && (
              <motion.div
                key="more-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={transition}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-0.5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="idea-description">Descrição</Label>
                    <Textarea
                      id="idea-description"
                      value={values.description}
                      onChange={(event) => update("description", event.target.value)}
                      placeholder="Do que se trata essa ideia?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="idea-location">Local</Label>
                      <Input
                        id="idea-location"
                        value={values.location}
                        onChange={(event) => update("location", event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="idea-city">Cidade</Label>
                      <Input
                        id="idea-city"
                        value={values.city}
                        onChange={(event) => update("city", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="idea-instagram">Instagram</Label>
                      <Input
                        id="idea-instagram"
                        value={values.instagram}
                        onChange={(event) => update("instagram", event.target.value)}
                        placeholder="@perfil"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="idea-website">Website</Label>
                      <Input
                        id="idea-website"
                        value={values.website}
                        onChange={(event) => update("website", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="idea-link">Link</Label>
                    <Input
                      id="idea-link"
                      value={values.link}
                      onChange={(event) => update("link", event.target.value)}
                      placeholder="Qualquer link relevante"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="idea-notes">Observações</Label>
                    <Textarea
                      id="idea-notes"
                      value={values.notes}
                      onChange={(event) => update("notes", event.target.value)}
                    />
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} loading={submitting}>
              {mode === "edit" ? (
                <Check data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              {mode === "edit" ? "Salvar alterações" : "Criar ideia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
