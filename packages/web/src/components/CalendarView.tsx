import { useState, useRef, useEffect } from 'react'
import type { EventItem } from '../types'
import { CATEGORY_DOT_COLORS, CATEGORY_LABELS, FACILITY_COLORS, getCongestionInfo } from '../lib/colorMap'
import { getTodayString, toDateStr } from '../lib/dateUtils'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
}

interface EventCardListProps {
  events: EventItem[]
  className: string
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

function getMaxCongestionRiskForDate(events: EventItem[], dateStr: string): number {
  let max = 0
  for (const e of events) {
    if (e.startDate <= dateStr && e.endDate >= dateStr && e.congestionRisk != null) {
      max = Math.max(max, e.congestionRisk)
    }
  }
  return max
}

function EventCardList({ events, className }: EventCardListProps) {
  return (
    <div className={className}>
      {events.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">イベントなし</p>
      ) : (
        events.map((e) => (
          <div key={e.id} className="border border-slate-200 rounded-xl p-3">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FACILITY_COLORS[e.facility] ?? 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {e.facility}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${CATEGORY_DOT_COLORS[e.category] ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>
                {CATEGORY_LABELS[e.category] ?? e.category}
              </span>
              {(() => {
                const info = getCongestionInfo(e.congestionRisk)
                return info ? (
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${info.badgeClass}`}>
                    {info.label}
                  </span>
                ) : null
              })()}
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
  )
}

export default function CalendarView({ events, onResetFilters }: Props) {
  const todayStr = getTodayString()
  const [year, setYear] = useState(() => parseInt(todayStr.slice(0, 4)))
  const [month, setMonth] = useState(() => parseInt(todayStr.slice(5, 7)) - 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Lock body scroll only while the mobile modal is open
  useEffect(() => {
    const isMobileViewport = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 1023px)').matches
      : true
    const shouldLockBody = Boolean(selectedDate) && isMobileViewport
    document.body.style.overflow = shouldLockBody ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedDate])

  // Drag-to-dismiss
  const dragStartY = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)
  const [isTouching, setIsTouching] = useState(false)

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    setIsTouching(true)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const dy = e.touches[0].clientY - dragStartY.current
    if (dy > 0) setDragY(dy)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    setIsTouching(false)
    if (dragStartY.current !== null) {
      const dy = e.changedTouches[0].clientY - dragStartY.current
      dragStartY.current = null
      if (dy > 80) {
        setDragY(window.innerHeight)
        setTimeout(() => {
          setSelectedDate(null)
          setDragY(0)
        }, 300)
      } else {
        setDragY(0)
      }
    }
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
    <div>
      {/* Month navigation header — same pattern as MonthView/DayView */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8f6f6]">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="前の月"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
        </button>
        <h2 className="text-base font-bold text-slate-900">{monthLabel}</h2>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="次の月"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:divide-x lg:divide-slate-200">
        <div className="p-4">
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
                return <div key={`empty-${i}`} className="bg-white min-h-[60px] lg:min-h-[90px]" />
              }

              const d = new Date(year, month, day)
              const dateStr = toDateStr(d)
              const isToday = dateStr === todayStr
              const categories = getCategoriesForDate(events, dateStr)
              const hasEvents = categories.length > 0
              const maxRisk = getMaxCongestionRiskForDate(events, dateStr)
              const congestionInfo = getCongestionInfo(maxRisk)

              return (
                <button
                  key={dateStr}
                  onClick={() => hasEvents ? setSelectedDate(dateStr) : undefined}
                  className={`bg-white min-h-[60px] lg:min-h-[90px] p-1 text-left w-full ${isToday ? 'bg-primary-50' : ''} ${hasEvents ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
                  data-today={isToday || undefined}
                  data-date={hasEvents ? dateStr : undefined}
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
                  {congestionInfo && (
                    <div className={`h-0.5 rounded-full mt-0.5 ${congestionInfo.barClass}`} />
                  )}
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
        </div>

        <div className="hidden lg:flex lg:flex-col min-h-[400px] bg-[#f8f6f6]">
          {selectedDate ? (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">{selectedLabel}のイベント</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEvents.length}件</p>
              </div>
              <EventCardList
                events={selectedEvents}
                className="overflow-y-auto p-3 flex flex-col gap-3 flex-1"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-2 p-6">
              <span className="material-symbols-outlined text-4xl">calendar_today</span>
              <p className="text-sm">日付を選択するとイベントが表示されます</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedDate && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          onClick={() => setSelectedDate(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Panel */}
          <div
            className="relative bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl max-h-[85dvh] flex flex-col"
            style={{ transform: `translateY(${dragY}px)`, transition: isTouching ? 'none' : 'transform 0.3s ease' }}
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
            <EventCardList
              events={selectedEvents}
              className="overflow-y-auto p-4 flex flex-col gap-3"
            />
          </div>
        </div>
      )}
    </div>
  )
}
