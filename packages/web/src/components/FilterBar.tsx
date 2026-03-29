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
    <div className="bg-[#f8f6f6] pt-3 pb-2 space-y-2">
      {/* Venue chips */}
      <div className="flex overflow-x-auto hide-scrollbar px-4 gap-2">
        <button
          onClick={() => onSetFacility(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
            filters.facility == null
              ? 'bg-primary-500 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          すべての施設
        </button>
        {FACILITIES.map((f) => (
          <button
            key={f}
            onClick={() => onSetFacility(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filters.facility === f
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="flex overflow-x-auto hide-scrollbar px-4 gap-2">
        <button
          onClick={() => onSetCategory(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
            filters.category == null
              ? 'bg-primary-500 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onSetCategory(c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filters.category === c
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
    </div>
  )
}
