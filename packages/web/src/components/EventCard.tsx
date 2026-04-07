'use client'

import { useState } from 'react'
import { CATEGORY_COLORS, CATEGORY_LABELS, FACILITY_COLORS, getCongestionInfo } from '../lib/colorMap'
import { getFacilityPhoto, getImageUrl } from '../lib/imageMap'
import type { EventItem } from '../types'
import type { ViewMode } from './FilterBar'

interface Props {
  event: EventItem
  viewMode?: ViewMode
}

export default function EventCard({ event, viewMode = 'list' }: Props) {
  const [imgError, setImgError] = useState(false)

  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-100 text-slate-700'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)
  const imageUrl = getImageUrl(event)
  const displaySrc = imgError ? getFacilityPhoto(event.facility) : imageUrl
  const isFacilityPhoto = !event.imageUrl || imgError

  const dateRange =
    event.startDate === event.endDate ? event.startDate : `${event.startDate} - ${event.endDate}`

  const barPercent =
    event.congestionRisk != null && event.congestionRisk > 0
      ? Math.round(event.congestionRisk * 100)
      : null

  const imageArea = (
    <div
      className={`relative shrink-0 overflow-hidden bg-black ${
        viewMode === 'grid' ? 'aspect-video w-full' : 'w-[40%]'
      }`}
    >
      <img
        src={displaySrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-[200%] object-cover blur-sm opacity-70"
      />
      <img
        src={displaySrc}
        alt={event.eventName}
        className={`relative z-10 h-full w-full ${isFacilityPhoto ? 'object-cover' : 'object-contain'}`}
        onError={() => setImgError(true)}
      />
      {congestionInfo && (
        <span
          className={`absolute right-2 top-2 z-20 rounded-full px-2 py-1 text-[10px] font-bold backdrop-blur-sm ${congestionInfo.imageBadgeClass}`}
        >
          {congestionInfo.label}
        </span>
      )}
    </div>
  )

  const textArea = (
    <div className="flex min-w-0 flex-col justify-center gap-1.5 p-3">
      <div className="flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${facilityBadgeClass}`}>
          {event.facility}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${categoryClass}`}>
          {categoryLabel}
        </span>
      </div>
      <h3 className={`text-sm font-bold leading-snug text-near-black ${viewMode === 'list' ? 'line-clamp-2' : ''}`}>
        {event.eventName}
      </h3>
      <p className="text-xs text-slate-500">開催 {dateRange}</p>
    </div>
  )

  return (
    <a href={event.sourceURL} target="_blank" rel="noopener noreferrer" className="block">
      <article
        className={`overflow-hidden rounded-2xl bg-white shadow-airbnb-card transition-shadow hover:shadow-airbnb-card-hover ${
          viewMode === 'grid' ? 'flex flex-col' : 'flex min-h-28'
        }`}
      >
        {imageArea}
        {textArea}
      </article>
      {congestionInfo && barPercent !== null && (
        <div className="mt-1 px-1" data-testid="congestion-bar">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full ${congestionInfo.barColorClass}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>
      )}
    </a>
  )
}
