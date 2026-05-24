'use client'

import { useEffect } from 'react'
import { TICKET_PLATFORMS } from '../lib/ticketPlatforms'

interface Props {
  open: boolean
  onClose: () => void
  eventName: string
}

export default function TicketModal({ open, onClose, eventName }: Props) {
  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      data-testid="ticket-modal-backdrop"
      onClick={onClose}
    >
      <div
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-airbnb-card-hover"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="閉じる"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="ticket-modal-title" className="pr-8 text-base font-bold leading-snug text-near-black">
          🎫 「{eventName}」のチケットを探す
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {TICKET_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.buildUrl(eventName)}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl p-3 text-center font-bold text-white transition-opacity hover:opacity-90 ${platform.color}`}
            >
              {platform.name}
            </a>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          ※販売元と入場用アプリ（MOALA等）は別の場合があります。スクショ提示は不可な公演が多いので公式アプリを必ず確認してください。
        </p>
      </div>
    </div>
  )
}
