// packages/web/src/components/EventCard.tsx
import type { EventItem } from '../types'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'
import { getImageUrl } from '../lib/imageMap'

interface Props {
  event: EventItem
}

export default function EventCard({ event }: Props) {
  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-50 text-slate-700'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)
  const imageUrl = getImageUrl(event.category, event.id)

  const dateRange = event.startDate === event.endDate
    ? event.startDate
    : `${event.startDate} 〜 ${event.endDate}`

  return (
    <a
      href={event.sourceURL}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <article className="flex rounded-xl bg-white shadow-sm overflow-hidden">

        {/* 左 40%: 画像エリア */}
        <div className="relative w-[40%] shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.eventName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '40px' }}>
                event
              </span>
            </div>
          )}

          {/* 混雑バッジ（congestionRisk > 0 のときのみ） */}
          {congestionInfo && (
            <span className={`absolute top-2 right-2 ${congestionInfo.imageBadgeClass} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
              {congestionInfo.label}
            </span>
          )}
        </div>

        {/* 右 60%: テキストエリア */}
        <div className="p-3 flex flex-col justify-center gap-1.5 min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${facilityBadgeClass}`}>
              {event.facility}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${categoryClass}`}>
              {categoryLabel}
            </span>
          </div>
          <h3 className="text-sm font-bold leading-snug text-slate-900">
            {event.eventName}
          </h3>
          <p className="text-xs text-slate-500">📅 {dateRange}</p>
        </div>

      </article>
    </a>
  )
}
