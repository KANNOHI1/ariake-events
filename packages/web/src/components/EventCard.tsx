import type { EventItem } from '../types'
import { FACILITY_COLORS, FACILITY_GRADIENTS, CATEGORY_COLORS, CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'

interface Props {
  event: EventItem
}

export default function EventCard({ event }: Props) {
  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-50 text-slate-700'
  const headerGradient = FACILITY_GRADIENTS[event.facility] ?? 'bg-gradient-to-br from-slate-400 to-slate-600'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
      {/* Hero image area (gradient placeholder) */}
      <div className={`relative h-48 w-full ${headerGradient}`}>
        {congestionInfo && (
          <span className={`absolute top-3 right-3 ${congestionInfo.imageBadgeClass} text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
            {congestionInfo.label}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${facilityBadgeClass}`}>
            {event.facility}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${categoryClass}`}>
            {categoryLabel}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          {event.eventName}
        </h3>

        <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
          {event.startDate === event.endDate
            ? event.startDate
            : `${event.startDate} 〜 ${event.endDate}`}
        </div>

        <a
          href={event.sourceURL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-primary-500 text-sm font-bold hover:text-primary-700"
        >
          公式サイト →
        </a>
      </div>
    </article>
  )
}
