import type { EventItem } from '../types'
import { FACILITY_COLORS, FACILITY_GRADIENTS, CATEGORY_COLORS, CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'
import ShareButton from './ShareButton'

interface Props {
  event: EventItem
}

export default function EventCard({ event }: Props) {
  const shareUrl = `https://kannohi1.github.io/ariake-events?event=${event.id}`
  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-600 text-white'
  const headerGradient = FACILITY_GRADIENTS[event.facility] ?? 'bg-gradient-to-br from-slate-400 to-slate-600'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-500 text-white'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Facility gradient header */}
      <div className={`h-20 relative ${headerGradient}`}>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${facilityBadgeClass} bg-black/20`}>
            {event.facility}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${categoryClass} bg-black/20`}>
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        {congestionInfo && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`inline-block w-2 h-2 rounded-full ${congestionInfo.dotClass}`} />
            <span className={`text-xs font-bold ${congestionInfo.textClass}`}>{congestionInfo.label}</span>
          </div>
        )}
        <h2 className="text-base font-bold text-slate-900 leading-snug mb-1">
          {event.eventName}
        </h2>
        <p className="text-sm text-slate-500 mb-3">
          {event.startDate === event.endDate
            ? event.startDate
            : `${event.startDate} 〜 ${event.endDate}`}
        </p>
        <div className="flex items-center justify-between">
          <a
            href={event.sourceURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 text-sm font-bold hover:text-primary-700 flex items-center gap-0.5"
          >
            公式サイト <span className="text-base">→</span>
          </a>
          <ShareButton
            title={event.eventName}
            text={`${event.facility} | ${event.startDate}`}
            url={shareUrl}
          />
        </div>
      </div>
    </article>
  )
}
