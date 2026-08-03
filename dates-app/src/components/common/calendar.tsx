import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  addMonths,
  formatMonthYear,
  getMonthMatrix,
  getWeekdayLabels,
  isSameDay,
  isSameMonth,
} from "@/lib/date"
import { cn } from "@/lib/utils"

interface CalendarProps {
  /** Data selecionada (controlado). */
  selected?: Date | null
  onSelectDate?: (date: Date) => void
  /** Datas que devem exibir um indicador de evento — sem dados reais nesta fase. */
  eventDates?: Date[]
  /** Mês exibido (controlado). Se omitido, o componente controla internamente. */
  month?: Date
  onMonthChange?: (month: Date) => void
  className?: string
}

export function Calendar({
  selected = null,
  onSelectDate,
  eventDates = [],
  month,
  onMonthChange,
  className,
}: CalendarProps) {
  const today = React.useMemo(() => new Date(), [])
  const [internalMonth, setInternalMonth] = React.useState(() => month ?? selected ?? today)
  const viewDate = month ?? internalMonth

  const goToMonth = (next: Date) => {
    setInternalMonth(next)
    onMonthChange?.(next)
  }

  const weeks = React.useMemo(() => getMonthMatrix(viewDate), [viewDate])
  const weekdayLabels = getWeekdayLabels()

  const hasEvent = (date: Date) => eventDates.some((event) => isSameDay(event, date))

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold capitalize text-foreground">
          {formatMonthYear(viewDate)}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => goToMonth(today)}>
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => goToMonth(addMonths(viewDate, -1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => goToMonth(addMonths(viewDate, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdayLabels.map((label) => (
          <span
            key={label}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {label}
          </span>
        ))}

        {weeks.flatMap((week) =>
          week.map((day) => {
            const outsideMonth = !isSameMonth(day, viewDate)
            const isToday = isSameDay(day, today)
            const isSelected = selected ? isSameDay(day, selected) : false
            const dayHasEvent = hasEvent(day)

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDate?.(day)}
                data-selected={isSelected}
                data-today={isToday}
                className={cn(
                  "relative flex h-9 flex-col items-center justify-center gap-0.5 rounded-md text-sm text-foreground transition-colors hover:bg-surface-hover",
                  outsideMonth && "text-muted-foreground/40",
                  isToday && !isSelected && "font-semibold ring-1 ring-inset ring-foreground/15",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {day.getDate()}
                {dayHasEvent && (
                  <span
                    className={cn(
                      "absolute bottom-1 size-1 rounded-full bg-foreground/60",
                      isSelected && "bg-primary-foreground",
                    )}
                  />
                )}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
