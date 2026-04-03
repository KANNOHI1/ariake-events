'use client'
// packages/web/src/components/EventCard.tsx
import { useState } from 'react'
import type { EventItem } from '../types'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'
import { getImageUrl, getFacilityPhoto } from '../lib/imageMap'
import type { ViewMode } from './FilterBar'

interface Props {
  event: EventItem
  viewMode?: ViewMode
}

export default function EventCard({ event, viewMode = 'list' }: Props) {
  const [imgError, setImgError] = useState(false)
  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-50 text-slate-700'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)
  const imageUrl = getImageUrl(event)
  const displaySrc = imgError ? getFacilityPhoto(event.facility) : imageUrl

  const dateRange = event.startDate === event.endDate
    ? event.startDate
    : `${event.startDate} 〜 ${event.endDate}`

  const imageArea = (
    <div className={`relative shrink-0 overflow-hidden bg-black ${viewMode === 'grid' ? 'w-full aspect-video' : 'w-[40%]'}`}>
      <img
        src={displaySrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
      />
      <img
        src={displaySrc}
        alt={event.eventName}
        className="relative z-10 w-full h-full object-contain"
        onError={() => setImgError(true)}
      />
      {congestionInfo && (
        <span className={`absolute top-2 right-2 z-20 ${congestionInfo.imageBadgeClass} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
          {congestionInfo.label}
        </span>
      )}
    </div>
  )

  const textArea = (
    <div className="p-3 flex flex-col justify-center gap-1.5 min-w-0">
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${facilityBadgeClass}`}>
          {event.facility}
        </span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${categoryClass}`}>
          {categoryLabel}
        </span>
      </div>
      <h3 className={`text-sm font-bold leading-snug text-slate-900 ${viewMode === 'list' ? 'line-clamp-2' : ''}`}>
        {event.eventName}
      </h3>
      <p className="text-xs text-slate-500">📅 {dateRange}</p>
    </div>
  )

  return (
    <a
      href={event.sourceURL}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <article className={`rounded-xl bg-white shadow-sm overflow-hidden ${viewMode === 'grid' ? 'flex flex-col' : 'flex h-28'}`}>
        {imageArea}
        {textArea}
      </article>
    </a>
  )
}
