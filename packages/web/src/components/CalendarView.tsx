import { useState, useRef, useEffect } from 'react'
import type { EventItem } from '../types'
import { CATEGORY_DOT_COLORS, CATEGORY_LABELS, FACILITY_COLORS } from '../lib/colorMap'
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

function getCategoriesForDate(events: EventItem[], dateStr: string): string[] {
  const categories = new Set<string>()
  for (const e of events) {
    if (e.startDate <= dateStr && e.endDate >= dateStr) {
      categories.add(e.category)
    }
  }
  return Array.from(categories)
}

function getEventsForDate(events: EventItem[], dateStr: string): EventItem[] {
  return events.filter((e) => e.startDate <= dateStr && e.endDate >= dateStr)
}

export default function CalendarView({ events, onResetFilters }: Props) {
  const todayStr = getTodayString()
  const [year, setYear] = useState(() => parseInt(todayStr.slice(0, 4)))
  const [month, setMonth] = useState(() => parseInt(todayStr.slice(5, 7)) - 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedDate ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedDate])

  // Drag-to-dismiss
  const dragStartY = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const dy = e.touches[0].clientY - dragStartY.current
    if (dy > 0) setDragY(dy)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current !== null) {
      const dy = e.changedTouches[0].clientY - dragStartY.current
      if (dy > 80) {
        setSelectedDate(null)
      }
    }
    dragStartY.current = null
    setDragY(0)
  }

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

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedEvents = selectedDate ? getEventsForDate(events, selectedDate) : []
  const selectedLabel = selectedDate
    ? `${parseInt(selectedDate.slice(5, 7))}月${parseInt(selectedDate.slice(8, 10))}日`
    : ''

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
          const hasEvents = categories.length > 0

          return (
            <button
              key={dateStr}
              onClick={() => hasEvents ? setSelectedDate(dateStr) : undefined}
              className={`bg-white min-h-[60px] p-1 text-left w-full ${isToday ? 'bg-primary-50' : ''} ${hasEvents ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
              data-today={isToday || undefined}
            >
              <span
                className={`text-xs font-medium block text-center leading-5 w-5 mx-auto rounded-full ${
                  isToday ? 'bg-primary-500 text-white' : 'text-slate-700'
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
            </button>
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

      {/* Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setSelectedDate(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Panel */}
          <div
            className="relative bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl max-h-[70vh] flex flex-col"
            style={{ transform: `translateY(${dragY}px)`, transition: dragY === 0 ? 'transform 0.2s ease' : 'none' }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">{selectedLabel}のイベント</h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer text-xl leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col gap-3">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">イベントなし</p>
              ) : (
                selectedEvents.map((e) => (
                  <div key={e.id} className="border border-slate-200 rounded-xl p-3">
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FACILITY_COLORS[e.facility] ?? 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {e.facility}
                      </span>
                      <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${CATEGORY_DOT_COLORS[e.category] ? `bg-slate-100 text-slate-700` : 'bg-slate-100 text-slate-600'}`}>
                        {CATEGORY_LABELS[e.category] ?? e.category}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-snug mb-1">{e.eventName}</p>
                    <p className="text-xs text-slate-500 mb-1.5">
                      {e.startDate === e.endDate ? e.startDate : `${e.startDate} 〜 ${e.endDate}`}
                    </p>
                    <a
                      href={e.sourceURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-500 hover:text-primary-700"
                    >
                      公式サイト →
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
