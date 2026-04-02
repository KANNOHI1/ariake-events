'use client'

import { useState } from 'react'
import { CATEGORY_LABELS } from '../lib/colorMap'
import type { FilterState } from '../lib/filter'
import type { EventCategory } from '../types'
import FilterSheet from './FilterSheet'

export type ViewMode = 'list' | 'grid'

interface Props {
  filters: FilterState
  onSetFacility: (facility: string | null) => void
  onSetCategory: (category: EventCategory | null) => void
  viewMode: ViewMode
  onToggleViewMode: () => void
}

export default function FilterBar({
  filters,
  onSetFacility,
  onSetCategory,
  viewMode,
  onToggleViewMode,
}: Props) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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
        <button
          onClick={() => setIsSheetOpen(true)}
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

      <FilterSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        filters={filters}
        onSetFacility={onSetFacility}
        onSetCategory={onSetCategory}
      />
    </>
  )
}
