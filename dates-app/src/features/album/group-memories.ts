import type { Memory } from "@/features/album/types"
import { formatMonthYear } from "@/lib/date"

export interface MonthGroup {
  key: string
  label: string
  memories: Memory[]
}

export interface YearGroup {
  year: number
  months: MonthGroup[]
}

/**
 * Agrupa em ano → mês, na mesma ordem em que `memories` já chegou (a
 * ordenação — mais recentes ou mais antigas — é decidida antes, por quem
 * chama). Uma passada só: como a lista já vem ordenada por `completedAt`,
 * todo item de um mesmo mês/ano é sempre consecutivo, então basta detectar
 * a troca de ano e de mês. Satisfaz "agrupar por mês/ano" e "agrupar por
 * ano" ao mesmo tempo — hierarquia única (ano grande, mês dentro), sem
 * exigir um seletor de modo de agrupamento à parte.
 */
export function groupMemoriesByMonth(memories: Memory[]): YearGroup[] {
  const years: YearGroup[] = []

  for (const memory of memories) {
    const date = new Date(memory.completedAt)
    const year = date.getFullYear()
    const monthKey = `${year}-${date.getMonth()}`

    let yearGroup = years[years.length - 1]?.year === year ? years[years.length - 1] : undefined
    if (!yearGroup) {
      yearGroup = { year, months: [] }
      years.push(yearGroup)
    }

    let monthGroup = yearGroup.months[yearGroup.months.length - 1]
    if (monthGroup?.key !== monthKey) {
      monthGroup = { key: monthKey, label: formatMonthYear(date), memories: [] }
      yearGroup.months.push(monthGroup)
    }

    monthGroup.memories.push(memory)
  }

  return years
}
