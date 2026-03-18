import { FACILITIES, CATEGORIES } from '../types'
import { CATEGORY_LABELS } from '../lib/colorMap'
import type { FilterState } from '../lib/filter'

interface Props {
  filters: FilterState
  onToggleFacility: (facility: string) => void
  onToggleCategory: (category: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export default function FilterBar({
  filters,
  onToggleFacility,
  onToggleCategory,
  onSelectAll,
  onDeselectAll,
}: Props) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-medium text-slate-500 shrink-0">施設</span>
        {FACILITIES.map((facility) => {
          const active = filters.facilities.includes(facility)
          return (
            <button
              key={facility}
              onClick={() => onToggleFacility(facility)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-150 cursor-pointer ${
                active
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-gray-50'
              }`}
              aria-pressed={active}
            >
              {facility}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-medium text-slate-500 shrink-0">カテゴリ</span>
        {CATEGORIES.map((category) => {
          const active = filters.categories.includes(category)
          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                active
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-gray-50'
              }`}
              aria-pressed={active}
            >
              {CATEGORY_LABELS[category]}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSelectAll}
          className="text-xs text-primary-500 hover:text-primary-700 cursor-pointer"
        >
          すべて選択
        </button>
        <span className="text-xs text-slate-300">|</span>
        <button
          onClick={onDeselectAll}
          className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          すべて解除
        </button>
      </div>
    </div>
  )
}
