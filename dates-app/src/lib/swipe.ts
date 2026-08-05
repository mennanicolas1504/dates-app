export const SWIPE_THRESHOLD = 60

/**
 * Decide se um gesto de arrastar horizontal (Framer Motion `PanInfo.offset.x`)
 * conta como "próximo"/"anterior" — mesma regra usada em qualquer swipe de
 * item-a-item do app (ver `Gallery`, `MemoryViewer`), para o limiar nunca
 * divergir entre eles.
 */
export function resolveSwipeDirection(
  offsetX: number,
  threshold: number = SWIPE_THRESHOLD,
): "prev" | "next" | null {
  if (offsetX < -threshold) return "next"
  if (offsetX > threshold) return "prev"
  return null
}
