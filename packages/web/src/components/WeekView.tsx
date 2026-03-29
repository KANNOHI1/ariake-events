import EventCard from './EventCard'
import type { EventItem } from '../types'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
}

function sortByStartDate(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export default function WeekView({ events, onResetFilters }: Props) {
  const sorted = sortByStartDate(events)

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
    <div className="flex flex-col gap-3 p-4">
      {sorted.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
