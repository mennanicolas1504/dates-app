import * as React from "react"

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  action?: ToastAction
  duration: number
}

export interface ToastOptions {
  title: string
  description?: string
  action?: ToastAction
  /** ms até auto-close; 0 desativa o auto-close. Padrão: 5000. */
  duration?: number
}

const DEFAULT_DURATION = 5000

let toasts: ToastItem[] = []
const listeners = new Set<() => void>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  listeners.forEach((listener) => listener())
}

function dismiss(id: string) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts = toasts.filter((item) => item.id !== id)
  emit()
}

function show(variant: ToastVariant, options: ToastOptions): string {
  const id = crypto.randomUUID()
  const duration = options.duration ?? DEFAULT_DURATION
  const item: ToastItem = { id, variant, duration, ...options }

  toasts = [...toasts, item]
  emit()

  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    )
  }

  return id
}

export const toast = {
  success: (options: ToastOptions) => show("success", options),
  error: (options: ToastOptions) => show("error", options),
  warning: (options: ToastOptions) => show("warning", options),
  info: (options: ToastOptions) => show("info", options),
  dismiss,
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return toasts
}

export function useToast() {
  const items = React.useSyncExternalStore(subscribe, getSnapshot)
  return { toasts: items, dismiss }
}
