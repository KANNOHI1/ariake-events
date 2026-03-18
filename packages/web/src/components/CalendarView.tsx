import { useState } from 'react'
import type { EventItem } from '../types'
import { CATEGORY_DOT_COLORS } from '../lib/colorMap'
import { getTodayString, toDateStr } from '../lib/dateUtils'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay() // 0=Sun
}

/** Returns unique categories for events on a given date string */
function getCategoriesForDate(events: EventItem[], dateStr: string): string[] {
  const categories = new Set<string>()
  for (const e of events) {
    if (e.startDate <= dateStr && e.endDate >= dateStr) {
      categories.add(e.category)
    }
  }
  return Array.from(categories)
}

export default function CalendarView({ events, onResetFilters }: Props) {
  const todayStr = getTodayString()
  const [year, setYear] = useState(() => parseInt(todayStr.slice(0, 4)))
  const [month, setMonth] = useState(() => parseInt(todayStr.slice(5, 7)) - 1) // 0-indexed

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = getFirstDayOfWeek(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthLabel = `${year}年${month + 1}月`
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  // Build calendar cells: leading empty cells + day cells
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
          aria-label="前月"
        >
          ‹
        </button>
        <h2 className="text-base font-bold text-slate-900">{monthLabel}</h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
          aria-label="翌月"
        >
          ›
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="bg-white min-h-[60px]" />
          }

          const d = new Date(year, month, day)
          const dateStr = toDateStr(d)
          const isToday = dateStr === todayStr
          const categories = getCategoriesForDate(events, dateStr)

          return (
            <div
              key={dateStr}
              className={`bg-white min-h-[60px] p-1 ${isToday ? 'bg-primary-50' : ''}`}
              data-today={isToday || undefined}
            >
              <span
                className={`text-xs font-medium block text-center leading-5 w-5 mx-auto rounded-full ${
                  isToday
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-700'
                }`}
              >
                {day}
              </span>
              <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className={`w-2 h-2 rounded-full inline-block ${
                      CATEGORY_DOT_COLORS[cat as keyof typeof CATEGORY_DOT_COLORS] ?? 'bg-slate-400'
                    }`}
                    title={cat}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="mb-3">条件に一致するイベントがありません</p>
          <button
            onClick={onResetFilters}
            className="text-sm text-primary-500 hover:text-primary-700 cursor-pointer"
          >
            フィルタをリセット
          </button>
        </div>
      )}
    </div>
  )
}
