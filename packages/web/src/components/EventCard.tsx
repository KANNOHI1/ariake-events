import type { EventItem } from '../types'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/colorMap'
import ShareButton from './ShareButton'

interface Props {
  event: EventItem
}

export default function EventCard({ event }: Props) {
  const shareUrl = `https://kannohi1.github.io/ariake-events?event=${event.id}`
  const facilityClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-100 text-slate-700 border border-slate-200'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center ${facilityClass}`}>
          {event.facility}
        </span>
        <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${categoryClass}`}>
          {categoryLabel}
        </span>
      </div>
      <h2 className="text-base font-bold text-slate-900 leading-snug mb-1">
        {event.eventName}
      </h2>
      <p className="text-sm text-slate-500">
        {event.startDate === event.endDate
          ? event.startDate
          : `${event.startDate} 〜 ${event.endDate}`}
      </p>
      <a
        href={event.sourceURL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm text-primary-500 hover:text-primary-700"
      >
        公式サイト →
      </a>
      <ShareButton
        title={event.eventName}
        text={`${event.facility} | ${event.startDate}`}
        url={shareUrl}
      />
    </article>
  )
}
