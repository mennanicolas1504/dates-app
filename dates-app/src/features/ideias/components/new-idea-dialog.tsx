import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, ImagePlus, Plus, X } from "lucide-react"

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
import { IDEA_CATEGORIES } from "@/features/ideias/data/categories"
import type { NewIdeaFormValues } from "@/features/ideias/types"
import { transition } from "@/lib/motion"
import { cn } from "@/lib/utils"

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
  images: [],
}

interface NewIdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pré-preenchimento (ex.: vindo de uma sugestão, ou os dados atuais ao editar). */
  initialValues?: Partial<NewIdeaFormValues>
  onSubmit: (values: NewIdeaFormValues) => void
  /** "edit" reaproveita o mesmo formulário para alterar uma ideia existente. */
  mode?: "create" | "edit"
}

function hasExtraDetails(values: NewIdeaFormValues): boolean {
  return Boolean(
    values.description ||
      values.location ||
      values.instagram ||
      values.website ||
      values.link ||
      values.city ||
      values.notes ||
      values.images.length > 0,
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
}: NewIdeaDialogProps) {
  const [values, setValues] = React.useState<NewIdeaFormValues>(EMPTY_VALUES)
  const [showMore, setShowMore] = React.useState(false)
  const [imageDraft, setImageDraft] = React.useState("")

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
      setImageDraft("")
    }
  }

  const canSubmit = values.title.trim().length > 0 && values.category.length > 0

  function update<K extends keyof NewIdeaFormValues>(key: K, value: NewIdeaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleAddImage() {
    const url = imageDraft.trim()
    if (!url) return
    update("images", [...values.images, url])
    setImageDraft("")
  }

  function handleRemoveImage(index: number) {
    update(
      "images",
      values.images.filter((_, i) => i !== index),
    )
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(values)
    onOpenChange(false)
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

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="idea-image">Imagens</Label>
                    <div className="flex gap-2">
                      <Input
                        id="idea-image"
                        value={imageDraft}
                        onChange={(event) => setImageDraft(event.target.value)}
                        placeholder="URL de uma imagem"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            handleAddImage()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddImage}
                        disabled={!imageDraft.trim()}
                        aria-label="Adicionar imagem"
                      >
                        <ImagePlus className="size-4" strokeWidth={1.75} />
                      </Button>
                    </div>

                    {values.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {values.images.map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className="group relative size-12 overflow-hidden rounded-md ring-1 ring-foreground/10"
                          >
                            <img src={url} alt="" className="size-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/50 group-hover:text-white"
                              aria-label="Remover imagem"
                            >
                              <X className="size-4" strokeWidth={2} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
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
