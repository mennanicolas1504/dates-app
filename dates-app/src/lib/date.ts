const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date)
}

export function formatShortTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date)
}

/** Bom dia / Boa tarde / Boa noite, a partir da hora local do dispositivo. */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

export function formatShortDateTime(date: Date): string {
  return `${formatShortDate(date)}, ${formatShortTime(date)}`
}

/**
 * "há 5 min" / "ontem" / "há 3 dias" / data curta — usado pela Central de
 * Notificações (histórico recente, não precisa de precisão de segundos).
 * Cai em `formatShortDate` depois de uma semana, quando "há N dias" deixa de
 * ser mais legível que a data em si.
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return "agora"
  if (diffMinutes < 60) return `há ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24 && isSameDay(date, now)) return `há ${diffHours} h`

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return "ontem"

  const diffDays = Math.floor(diffMinutes / (60 * 24))
  if (diffDays < 7) return `há ${diffDays} dias`

  return formatShortDate(date)
}

/** `time` no formato "HH:mm" (valor nativo de `<input type="time">`). */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const combined = new Date(date)
  combined.setHours(hours || 0, minutes || 0, 0, 0)
  return combined
}

/** Inverso de `combineDateAndTime` — extrai "HH:mm" no fuso local para preencher o input de hora. */
export function toTimeInputValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS
}

/**
 * Matriz de semanas (6 linhas x 7 dias) cobrindo o mês de `monthDate`,
 * incluindo dias de meses adjacentes para preencher a grade.
 */
export function getMonthMatrix(monthDate: Date): Date[][] {
  const firstOfMonth = startOfMonth(monthDate)
  const startOffset = firstOfMonth.getDay()
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - startOffset)

  const weeks: Date[][] = []
  const cursor = new Date(gridStart)

  for (let week = 0; week < 6; week += 1) {
    const days: Date[] = []
    for (let day = 0; day < 7; day += 1) {
      days.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(days)
  }

  return weeks
}
