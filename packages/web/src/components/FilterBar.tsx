'use client'

import { useState } from 'react'
import { CATEGORY_LABELS } from '../lib/colorMap'
import type { FilterState } from '../lib/filter'
import { CATEGORIES, FACILITIES, type EventCategory } from '../types'
import FilterSheet from './FilterSheet'

export type ViewMode = 'list' | 'grid'

interface Props {
  filters: FilterState
  onSetFacility: (facility: string | null) => void
  onSetCategory: (category: EventCategory | null) => void
  viewMode: ViewMode
  onToggleViewMode: () => void
}

const CHIP_BASE = 'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer'
const CHIP_ACTIVE = 'bg-primary-500 text-white'
const CHIP_INACTIVE = 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'

function chipClass(active: boolean) {
  return `${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`
}

export default function FilterBar({
  filters,
  onSetFacility,
  onSetCategory,
  viewMode,
  onToggleViewMode,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount =
    (filters.facility !== null ? 1 : 0) +
    (filters.category !== null ? 1 : 0)

  const activeLabel = [
    filters.facility,
    filters.category !== null ? CATEGORY_LABELS[filters.category] : null,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <>
      <div className='bg-[#f8f6f6] px-4 py-3 flex items-center gap-3'>
        {/* Trigger button + Desktop Popover */}
        <div className='relative'>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className={[
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
              activeCount > 0
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            <span className='material-symbols-outlined' style={{ fontSize: '16px' }}>tune</span>
            絞り込み
            {activeCount > 0 && (
              <span
                data-testid='filter-badge'
                className='bg-white text-primary-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'
              >
                {activeCount}
              </span>
            )}
          </button>

          {/* Desktop Popover Panel */}
          {isOpen && (
            <div
              data-testid='filter-popover'
              className='hidden lg:block absolute left-0 top-full mt-2 w-[540px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.16)] border border-slate-100 p-5 z-50'
            >
              <section className='mb-5'>
                <p className='mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide'>施設</p>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() => onSetFacility(null)}
                    className={chipClass(filters.facility === null)}
                  >
                    すべての施設
                  </button>
                  {FACILITIES.map((facility) => (
                    <button
                      key={facility}
                      type='button'
                      onClick={() => onSetFacility(facility)}
                      className={chipClass(filters.facility === facility)}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className='mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide'>カテゴリ</p>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() => onSetCategory(null)}
                    className={chipClass(filters.category === null)}
                  >
                    すべて
                  </button>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type='button'
                      onClick={() => onSetCategory(category)}
                      className={chipClass(filters.category === category)}
                    >
                      {CATEGORY_LABELS[category]}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {activeLabel && (
          <span className='text-sm text-slate-500 truncate flex-1'>{activeLabel}</span>
        )}

        <div className='ml-auto'>
          <button
            onClick={onToggleViewMode}
            aria-label={viewMode === 'list' ? 'グリッド表示に切り替え' : 'リスト表示に切り替え'}
            className='w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary-500 transition-colors cursor-pointer'
          >
            <span className='material-symbols-outlined' style={{ fontSize: '18px' }}>
              {viewMode === 'list' ? 'grid_view' : 'view_list'}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop backdrop (click outside to close) */}
      {isOpen && (
        <div
          className='hidden lg:block fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile BottomSheet */}
      <FilterSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        filters={filters}
        onSetFacility={onSetFacility}
        onSetCategory={onSetCategory}
      />
    </>
  )
}
