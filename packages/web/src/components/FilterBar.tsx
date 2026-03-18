import { FACILITIES, CATEGORIES } from '../types'
import { CATEGORY_LABELS } from '../lib/colorMap'
import type { FilterState } from '../lib/filter'
import type { EventCategory } from '../types'

interface Props {
  filters: FilterState
  onSetFacility: (facility: string | null) => void
  onSetCategory: (category: EventCategory | null) => void
}

export default function FilterBar({ filters, onSetFacility, onSetCategory }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 shrink-0">施設</label>
          <select
            value={filters.facility ?? ''}
            onChange={(e) => onSetFacility(e.target.value || null)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value="">すべての施設</option>
            {FACILITIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 shrink-0">カテゴリ</label>
          <select
            value={filters.category ?? ''}
            onChange={(e) => onSetCategory((e.target.value as EventCategory) || null)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value="">すべてのカテゴリ</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
