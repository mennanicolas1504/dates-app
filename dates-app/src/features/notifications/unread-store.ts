import * as React from "react"

import { fetchUnreadNotificationsCount } from "@/features/notifications/api"

/**
 * Store externa para a contagem de não lidas (badge do sino, `Header`) —
 * mesmo padrão de `hooks/use-toast.ts` (módulo com estado + listeners +
 * `useSyncExternalStore`), não um `useState` local: o Header e a própria
 * tela de Notificações precisam enxergar o mesmo número, e refresh depois
 * de "marcar como lida" não pode esperar a próxima troca de rota.
 *
 * Sem realtime/push (Fase 20: "não implementar push nesta fase") — o valor
 * só é revalidado quando algo no próprio client pede (`refreshUnreadNotificationsCount`),
 * nunca por uma assinatura de servidor.
 */
let count = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return count
}

export async function refreshUnreadNotificationsCount(userId: string | null) {
  const next = userId ? await fetchUnreadNotificationsCount(userId) : 0
  count = next
  emit()
}

export function useUnreadNotificationsCount() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}
