import { constraintsFor } from "@/lib/media/constraints"
import type { MediaError, MediaKind } from "@/lib/media/types"

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/**
 * Valida um único arquivo contra as regras da `kind` — tipo e tamanho.
 * Quantidade é validada à parte (`validateCount`) porque depende de quantos
 * arquivos já existem, não só do arquivo em si.
 */
export function validateFile(file: File, kind: MediaKind): MediaError | null {
  const constraints = constraintsFor(kind)

  if (!constraints.allowedMimeTypes.includes(file.type)) {
    return {
      code: "invalid_type",
      message: `Formato não suportado. Use: ${constraints.allowedMimeTypes.join(", ")}.`,
    }
  }

  if (file.size > constraints.maxSizeBytes) {
    return {
      code: "too_large",
      message: `Arquivo muito grande. Limite: ${formatMB(constraints.maxSizeBytes)}.`,
    }
  }

  return null
}

/** `currentCount` = quantas mídias essa `kind`+dono já tem antes deste upload. */
export function validateCount(
  kind: MediaKind,
  currentCount: number,
  incomingCount: number,
): MediaError | null {
  const { maxCount } = constraintsFor(kind)
  if (maxCount === null) return null

  if (currentCount + incomingCount > maxCount) {
    return {
      code: "too_many",
      message: `Limite de ${maxCount} ${maxCount === 1 ? "arquivo" : "arquivos"} atingido.`,
    }
  }

  return null
}
