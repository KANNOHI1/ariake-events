import EventCard from './EventCard'
import type { EventItem } from '../types'
import { FACILITIES } from '../types'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
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

export default function TodayView({ events, onResetFilters }: Props) {
  const sorted = sortByFacility(events)

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {sorted.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
