import { useState } from 'react'
import EventCard from './EventCard'
import type { EventItem } from '../types'
import { getTodayString } from '../lib/dateUtils'
import { sortEvents } from '../lib/sortEvents'
import type { ViewMode } from './FilterBar'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
  viewMode: ViewMode
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function MonthView({ events, onResetFilters, viewMode }: Props) {
  const todayStr = getTodayString()
  const [year, setYear] = useState(() => parseInt(todayStr.slice(0, 4)))
  const [month, setMonth] = useState(() => parseInt(todayStr.slice(5, 7)) - 1)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthStart = `${year}-${pad(month + 1)}-01`
  const monthEnd = `${year}-${pad(month + 1)}-${pad(getDaysInMonth(year, month))}`

  const monthEvents = sortEvents(
    events.filter(e => e.startDate <= monthEnd && e.endDate >= monthStart)
  )

  const gridClass = viewMode === 'grid'
    ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4'
    : 'grid grid-cols-1 lg:grid-cols-2 gap-3 p-4'

  return (
    <div>
      {/* Month navigation header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="前の月"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
        </button>
        <h2 className="text-base font-bold text-slate-900">{year}年{month + 1}月</h2>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          aria-label="次の月"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
        </button>
      </div>

      {monthEvents.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="mb-4">{year}年{month + 1}月のイベントはありません</p>
          <button
            onClick={onResetFilters}
            className="text-sm text-primary-500 hover:text-primary-700 cursor-pointer"
          >
            フィルタをリセット
          </button>
        </div>
      ) : (
        <div className={gridClass}>
          {monthEvents.map((event) => (
            <EventCard key={event.id} event={event} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}
