'use client'

import { useState } from 'react'
import { CATEGORY_COLORS, CATEGORY_LABELS, FACILITY_COLORS, getCongestionInfo } from '../lib/colorMap'
import { getFacilityPhoto, getImageUrl } from '../lib/imageMap'
import { shouldShowTicketLinks } from '../lib/ticketPlatforms'
import type { EventItem } from '../types'
import type { ViewMode } from './FilterBar'
import TicketModal from './TicketModal'

interface Props {
  event: EventItem
  // viewMode は互換のため受け取るが Pinterest 風一本化で未使用
  viewMode?: ViewMode
}

export default function EventCard({ event }: Props) {
  const [imgError, setImgError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-100 text-slate-700'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)
  const imageUrl = getImageUrl(event)
  const displaySrc = imgError ? getFacilityPhoto(event.facility) : imageUrl
  const showTicket = shouldShowTicketLinks(event.category)

  const dateRange =
    event.startDate === event.endDate ? event.startDate : `${event.startDate} - ${event.endDate}`

  return (
    <div>
      <article className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
        <a
          href={event.sourceURL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col"
        >
          <div className="relative w-full overflow-hidden bg-slate-100">
            <img
              src={displaySrc}
              alt={event.eventName}
              className="block h-auto w-full"
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
          <div className="flex min-w-0 flex-col gap-1.5 p-3">
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${facilityBadgeClass}`}>
                {event.facility}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${categoryClass}`}>
                {categoryLabel}
              </span>
            </div>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-near-black">
              {event.eventName}
            </h3>
            <p className="text-xs text-slate-500">開催 {dateRange}</p>
          </div>
        </a>
        {showTicket && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full border-t border-slate-100 px-3 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
          >
            🎫 チケットを探す
          </button>
        )}
      </article>
      {showTicket && (
        <TicketModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          eventName={event.eventName}
          facility={event.facility}
        />
      )}
    </div>
  )
}
