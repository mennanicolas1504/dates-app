import * as React from "react"
import { ImagePlus } from "lucide-react"

import { cn } from "@/lib/utils"

interface MediaDropzoneProps {
  multiple?: boolean
  disabled?: boolean
  /** Ex.: `constraintsFor(kind).allowedMimeTypes.join(",")`. */
  accept?: string
  onFilesSelected: (files: File[]) => void
  label?: string
  hint?: string
  className?: string
}

/**
 * Área de arrastar-e-soltar + clique para escolher arquivo. Não sabe nada
 * sobre validação, upload ou de qual `kind` de mídia se trata — só
 * coleciona `File[]` e devolve pro chamador (normalmente `useMediaUpload`).
 * Visual segue a mesma linguagem da tela de Login (cantos arredondados,
 * borda tracejada neutra — mesmo padrão de `EmptyState`/`Gallery` vazios).
 */
export function MediaDropzone({
  multiple = false,
  disabled = false,
  accept,
  onFilesSelected,
  label = "Arraste imagens ou clique para escolher",
  hint,
  className,
}: MediaDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    onFilesSelected(Array.from(fileList))
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          openPicker()
        }
      }}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragActive(false)
        if (!disabled) handleFiles(event.dataTransfer.files)
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-8 text-center transition-colors",
        dragActive ? "border-brand bg-brand/5" : "hover:bg-muted/40",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ImagePlus className="size-5" strokeWidth={1.5} />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ""
        }}
        className="sr-only"
      />
    </div>
  )
}
