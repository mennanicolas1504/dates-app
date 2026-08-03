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
