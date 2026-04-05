import type { ViewType } from './ViewTabs'

interface Props {
  activeView: ViewType
  onChangeView: (view: ViewType) => void
}

const NAV_ITEMS: { id: ViewType; label: string; icon: string }[] = [
  { id: 'today', label: '日', icon: 'calendar_today' },
  { id: 'month', label: '月', icon: 'calendar_month' },
  { id: 'calendar', label: 'カレンダー', icon: 'event_note' },
  { id: 'transport', label: '交通', icon: 'directions_bus' },
]

export default function BottomNav({ activeView, onChangeView }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100">
      <div className="flex justify-around items-center px-2 py-2 max-w-6xl mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                active ? 'text-primary-500' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-selected={active}
              role="tab"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{item.icon}</span>
              <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
