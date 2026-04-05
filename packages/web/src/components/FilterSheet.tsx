'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORY_LABELS } from '../lib/colorMap'
import type { FilterState } from '../lib/filter'
import { CATEGORIES, FACILITIES, type EventCategory } from '../types'

export interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onSetFacility: (facility: string | null) => void
  onSetCategory: (category: EventCategory | null) => void
}

const CHIP_BASE =
  'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer'
const CHIP_ACTIVE = 'bg-primary-500 text-white'
const CHIP_INACTIVE = 'bg-white border border-slate-200 text-slate-600'

function getChipClassName(isActive: boolean) {
  return `${CHIP_BASE} ${isActive ? CHIP_ACTIVE : CHIP_INACTIVE}`
}

export default function FilterSheet({
  isOpen,
  onClose,
  filters,
  onSetFacility,
  onSetCategory,
}: FilterSheetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) {
    return null
  }

  const content = (
    <>
      <div
        data-testid="filter-sheet-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
      />

      <div
        className={[
          'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[#f8f6f6] shadow-[0_-12px_40px_rgba(15,23,42,0.16)]',
          'transition-transform duration-300 ease-out',
          'translate-y-0',
          'lg:hidden',
        ].join(' ')}
      >
        <div className="max-h-[80vh] overflow-y-auto px-5 pb-8 pt-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">{'\u7d5e\u308a\u8fbc\u307f'}</h2>
            <button
              type="button"
              aria-label={'\u30b7\u30fc\u30c8\u3092\u9589\u3058\u308b'}
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <section className="mb-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">{'\u65bd\u8a2d'}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSetFacility(null)}
                className={getChipClassName(filters.facility === null)}
              >
                {'\u3059\u3079\u3066\u306e\u65bd\u8a2d'}
              </button>
              {FACILITIES.map((facility) => (
                <button
                  key={facility}
                  type="button"
                  onClick={() => onSetFacility(facility)}
                  className={getChipClassName(filters.facility === facility)}
                >
                  {facility}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-3 text-sm font-semibold text-slate-700">{'\u30ab\u30c6\u30b4\u30ea'}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSetCategory(null)}
                className={getChipClassName(filters.category === null)}
              >
                {'\u3059\u3079\u3066'}
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSetCategory(category)}
                  className={getChipClassName(filters.category === category)}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )

  return createPortal(content, document.body)
}
