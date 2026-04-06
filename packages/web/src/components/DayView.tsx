'use client'

import { useState } from 'react'
import EventCard from './EventCard'
import type { EventItem } from '../types'
import { getTodayString, addDays } from '../lib/dateUtils'
import type { ViewMode } from './FilterBar'
import { sortEvents } from '../lib/sortEvents'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
  viewMode: ViewMode
}

export default function DayView({ events, onResetFilters, viewMode }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => getTodayString())

  const today = getTodayString()
  const isToday = selectedDate === today

  const prevDay = () => setSelectedDate(d => addDays(d, -1))
  const nextDay = () => setSelectedDate(d => addDays(d, 1))
  const goToToday = () => setSelectedDate(today)

  const dayEvents = sortEvents(
    events.filter(e => e.startDate <= selectedDate && e.endDate >= selectedDate)
  )

  // Short label for nav header: "M月D日(曜)" without year
  const shortLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Tokyo',
  })

  const gridClass =
    viewMode === 'grid'
      ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4'
      : 'grid grid-cols-1 lg:grid-cols-2 gap-3 p-4'

  return (
    <div>
      {/* Day navigation header — same pattern as MonthView */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={prevDay}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="前の日"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">{shortLabel}</h2>
          {!isToday && (
            <button
              onClick={goToToday}
              className="text-xs font-medium text-primary-500 bg-[#fff3ed] px-2 py-0.5 rounded-full hover:bg-orange-100 transition-colors cursor-pointer"
            >
              今日
            </button>
          )}
        </div>

        <button
          onClick={nextDay}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="次の日"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
        </button>
      </div>

      {dayEvents.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="mb-4">この日のイベントはありません</p>
          <button
            onClick={onResetFilters}
            className="text-sm text-primary-500 underline cursor-pointer"
          >
            絞り込みをリセット
          </button>
        </div>
      ) : (
        <div className={gridClass}>
          {dayEvents.map((event) => (
            <EventCard key={event.id} event={event} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}
