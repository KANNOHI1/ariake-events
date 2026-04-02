import EventCard from './EventCard'
import type { EventItem } from '../types'
import { FACILITIES } from '../types'
import type { ViewMode } from './FilterBar'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
  viewMode: ViewMode
}

/** Sort order: defined facility order, then by eventName */
const FACILITY_ORDER = FACILITIES as unknown as string[]

function sortByFacility(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    const ai = FACILITY_ORDER.indexOf(a.facility)
    const bi = FACILITY_ORDER.indexOf(b.facility)
    if (ai !== bi) return ai - bi
    return a.eventName.localeCompare(b.eventName, 'ja')
  })
}

export default function TodayView({ events, onResetFilters, viewMode }: Props) {
  const sorted = sortByFacility(events)
  const todayLabel = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="mb-4">条件に一致するイベントがありません</p>
        <button
          onClick={onResetFilters}
          className="text-sm text-primary-500 hover:text-primary-700 cursor-pointer"
        >
          フィルタをリセット
        </button>
      </div>
    )
  }

  const gridClass = viewMode === 'grid'
    ? 'columns-2 lg:columns-3 gap-x-3 p-4'
    : 'grid grid-cols-1 lg:grid-cols-2 gap-3 p-4'

  return (
    <>
      <div className="px-4 pt-3 pb-1 flex items-baseline gap-2">
        <span className="text-base font-semibold text-slate-800">今日のイベント</span>
        <span className="text-sm text-slate-500">{todayLabel}</span>
      </div>
      <div className={gridClass}>
        {sorted.map((event) => (
          <EventCard key={event.id} event={event} viewMode={viewMode} />
        ))}
      </div>
    </>
  )
}
