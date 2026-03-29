type ViewType = 'today' | 'month' | 'calendar' | 'transport'

interface Props {
  activeView: ViewType
  onChangeView: (view: ViewType) => void
}

const TABS: { id: ViewType; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'month', label: '月' },
  { id: 'calendar', label: 'カレンダー' },
  { id: 'transport', label: '交通' },
]

export type { ViewType }

export default function ViewTabs({ activeView, onChangeView }: Props) {
  return (
    <div className="flex border-b border-slate-200/60 px-4">
      {TABS.map((tab) => {
        const active = activeView === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChangeView(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
              active
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            aria-selected={active}
            role="tab"
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
