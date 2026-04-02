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

  const dateRange = event.startDate === event.endDate
    ? event.startDate
    : `${event.startDate} 〜 ${event.endDate}`

  const imageArea = (
    <div className={`relative shrink-0 ${viewMode === 'grid' ? 'w-full aspect-video' : 'w-[40%]'}`}>
      <img
        src={imgError ? getFacilityPhoto(event.facility) : imageUrl}
        alt={event.eventName}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
      {congestionInfo && (
        <span className={`absolute top-2 right-2 ${congestionInfo.imageBadgeClass} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
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
      className={`block ${viewMode === 'grid' ? 'break-inside-avoid mb-3' : ''}`}
    >
      <article className={`rounded-xl bg-white shadow-sm overflow-hidden ${viewMode === 'grid' ? 'flex flex-col' : 'flex h-28'}`}>
        {imageArea}
        {textArea}
      </article>
    </a>
  )
}
