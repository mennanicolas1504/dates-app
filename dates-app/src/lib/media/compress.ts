const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.82

interface CompressResult {
  file: File
  width: number
  height: number
}

/**
 * Redimensiona (maior lado ≤ `MAX_DIMENSION`) e reencoda como JPEG via
 * `<canvas>` — API nativa do browser, sem dependência nova. Nunca lança: se
 * o formato não puder ser decodificado (ex: HEIC em navegadores sem
 * suporte), devolve o arquivo original. Documentos/vídeos não passam por
 * aqui — `uploadMedia` (ver `api.ts`) só chama isto quando `mediaType` da
 * `kind` é "image" (ver `constraints.ts`), então suportar outros tipos no
 * futuro é não chamar compressão para eles, não estender esta função.
 */
export async function compressImage(file: File): Promise<CompressResult> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return { file, width: bitmap.width, height: bitmap.height }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    )
    if (!blob) return { file, width, height }

    const compressed = new File([blob], renameToJpeg(file.name), { type: "image/jpeg" })

    // Só usa a versão comprimida se ela realmente for menor — imagens
    // pequenas ou já otimizadas às vezes crescem ao reencodar.
    return compressed.size < file.size ? { file: compressed, width, height } : { file, width, height }
  } catch {
    return { file, width: 0, height: 0 }
  }
}

function renameToJpeg(originalName: string): string {
  const withoutExtension = originalName.replace(/\.[^./]+$/, "")
  return `${withoutExtension || "imagem"}.jpg`
}
