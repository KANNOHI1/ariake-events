'use client'

import { useEffect, useMemo, useState } from 'react'
import { timetable, type RouteData, type TabGroup } from '../data/timetable'
import { filterUpcoming, getDayType, getSchedule } from '../lib/timetableUtils'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const ROUTE_LOGOS: Record<string, string> = {
  りんかい線: `${basePath}/transport/rinkai.svg`,
  ゆりかもめ: `${basePath}/transport/yurikamome.svg`,
  都バス: `${basePath}/transport/toei.svg`,
  海01: `${basePath}/transport/toei.svg`,
  '都05-2': `${basePath}/transport/toei.svg`,
  東16: `${basePath}/transport/toei.svg`,
  BRT: `${basePath}/transport/brt.png`,
}

const TABS: Array<{ key: TabGroup; label: string }> = [
  { key: 'rail', label: '鉄道' },
  { key: 'brt', label: 'BRT' },
  { key: 'bus', label: 'バス' },
]

type DecoratedDirection = RouteData['directions'][number] & { upcoming: string[] }

type DecoratedRoute = {
  name: RouteData['name']
  station: RouteData['station']
  walkMinutes: RouteData['walkMinutes']
  tabGroup: RouteData['tabGroup']
  directions: DecoratedDirection[]
}

function getNowString(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getDayLabel(dayType: ReturnType<typeof getDayType>): string {
  if (dayType === 'saturday') return '土曜ダイヤ'
  if (dayType === 'holiday') return '休日ダイヤ'
  return '平日ダイヤ'
}

function RouteCard({ route }: { route: DecoratedRoute }) {
  const logo = ROUTE_LOGOS[route.name]
  const maxRows = Math.max(0, ...route.directions.map((direction) => direction.upcoming.length))
  const visibleRows = Math.min(maxRows, 6)
  const hasDepartures = maxRows > 0

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        {logo ? (
          <img src={logo} alt={route.name} className="h-7 w-7 flex-none object-contain" />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{route.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span>{route.station}</span>
            <span aria-hidden="true">・</span>
            <span>{`徒歩${route.walkMinutes}分`}</span>
          </div>
        </div>
      </header>

      {!hasDepartures ? (
        <p className="px-4 py-5 text-center text-sm text-slate-400">本日の終電は終了しました</p>
      ) : (
        <div>
          <div
            className="grid border-b border-slate-100 bg-slate-50"
            style={{ gridTemplateColumns: `repeat(${route.directions.length}, minmax(0, 1fr))` }}
          >
            {route.directions.map((direction, index) => (
              <div
                key={direction.label}
                className={`px-3 py-2 text-center text-xs font-medium text-slate-600 ${
                  index > 0 ? 'border-l border-slate-200' : ''
                }`}
              >
                {direction.label}
              </div>
            ))}
          </div>

          {Array.from({ length: visibleRows }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
              style={{ gridTemplateColumns: `repeat(${route.directions.length}, minmax(0, 1fr))` }}
            >
              {route.directions.map((direction, index) => (
                <div
                  key={`${direction.label}-${rowIndex}`}
                  className={`px-3 py-2 text-center text-sm tabular-nums text-slate-700 ${
                    index > 0 ? 'border-l border-slate-100' : ''
                  }`}
                >
                  {direction.upcoming[rowIndex] ?? ''}
                </div>
              ))}
            </div>
          ))}

          {maxRows > visibleRows ? (
            <p className="border-t border-slate-100 px-4 py-2 text-center text-xs text-slate-400">
              {`ほか ${maxRows - visibleRows} 本`}
            </p>
          ) : null}
        </div>
      )}
    </article>
  )
}

export default function TransportView() {
  const [activeTab, setActiveTab] = useState<TabGroup>('rail')
  const [now, setNow] = useState(getNowString)
  const dayType = getDayType()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(getNowString())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  const routes = useMemo<DecoratedRoute[]>(
    () =>
      timetable
        .filter((route) => route.tabGroup === activeTab)
        .map<DecoratedRoute>((route) => ({
          ...route,
          directions: route.directions.map<DecoratedDirection>((direction) => ({
            ...direction,
            upcoming: filterUpcoming(getSchedule(direction, dayType), now),
          })),
        })),
    [activeTab, dayType, now]
  )

  return (
    <div className="flex h-full flex-col">
      <p className="px-4 pb-2 pt-3 text-xs text-slate-400">{`${now} 現在・${getDayLabel(dayType)}`}</p>

      <div className="flex border-b border-slate-200 px-4" role="tablist" aria-label="交通手段">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {routes.map((route) => (
          <RouteCard key={`${route.name}-${route.station}`} route={route} />
        ))}
      </div>
    </div>
  )
}
