import { useEffect, useMemo, useState } from 'react'
import { timetable } from '../data/timetable'
import { filterUpcoming, isHoliday } from '../lib/timetableUtils'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const ROUTE_LOGOS: Record<string, string> = {
  [timetable[0].name]: `${basePath}/transport/rinkai.svg`,
  [timetable[1].name]: `${basePath}/transport/yurikamome.svg`,
  [timetable[2].name]: `${basePath}/transport/toei.svg`,
  [timetable[3].name]: `${basePath}/transport/brt.png`,
}

function getNowString(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default function TransportView() {
  const [now, setNow] = useState(getNowString)
  const holiday = isHoliday()

  useEffect(() => {
    const timer = setInterval(() => setNow(getNowString()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const routes = useMemo(
    () =>
      timetable.map((route) => ({
        ...route,
        directions: route.directions.map((dir) => ({
          ...dir,
          upcoming: filterUpcoming(holiday ? dir.holiday : dir.weekday, now),
        })),
      })),
    [now, holiday]
  )

  return (
    <div className="p-4">
      <p className="mb-3 text-xs text-slate-500">
        {now} {'\u73fe\u5728\u30fb\u6b21\u767a\u76ee\u5b89'} {holiday ? '\u795d\u4f11\u65e5' : '\u5e73\u65e5'}
        {'\u30c0\u30a4\u30e4'}
      </p>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full border-collapse text-sm whitespace-nowrap">
          <thead>
            <tr>
              {routes.map((route) => (
                <th
                  key={route.name}
                  colSpan={route.directions.length}
                  className="border border-slate-200 bg-slate-50 px-3 py-3 text-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={ROUTE_LOGOS[route.name]}
                      alt={route.name}
                      className="h-7 object-contain"
                    />
                    <span className="text-xs font-bold text-slate-800">{route.name}</span>
                  </div>
                </th>
              ))}
            </tr>

            <tr>
              {routes.map((route) => (
                <td
                  key={route.name}
                  colSpan={route.directions.length}
                  className="border border-slate-200 bg-slate-100 px-3 py-1 text-center text-xs text-slate-500"
                >
                  {route.station}
                </td>
              ))}
            </tr>

            <tr>
              {routes.map((route) => (
                <td
                  key={route.name}
                  colSpan={route.directions.length}
                  className="border border-slate-200 bg-slate-100 px-3 py-1 text-center text-xs text-slate-400"
                >
                  {'\u5f92\u6b69'}
                  {route.walkMinutes}
                  {'\u5206'}
                </td>
              ))}
            </tr>

            <tr>
              {routes.flatMap((route) =>
                route.directions.map((dir) => (
                  <th
                    key={`${route.name}-${dir.label}`}
                    className="sticky top-[112px] z-10 border border-slate-300 bg-slate-200 px-3 py-1.5 text-center text-xs font-medium text-slate-700"
                  >
                    {dir.label}
                  </th>
                ))
              )}
            </tr>
          </thead>

          <tbody>
            {Array.from({
              length: Math.max(0, ...routes.flatMap((route) => route.directions.map((dir) => dir.upcoming.length))),
            }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                {routes.flatMap((route) =>
                  route.directions.map((dir) => (
                    <td
                      key={`${route.name}-${dir.label}-${rowIndex}`}
                      className="border border-slate-200 px-4 py-1.5 text-center tabular-nums text-slate-700"
                    >
                      {dir.upcoming[rowIndex] ?? ''}
                    </td>
                  ))
                )}
              </tr>
            ))}
            {routes.every((route) => route.directions.every((dir) => dir.upcoming.length === 0)) && (
              <tr>
                <td
                  colSpan={routes.reduce((sum, route) => sum + route.directions.length, 0)}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  {'\u672c\u65e5\u306e\u7d42\u96fb\u306f\u7d42\u4e86\u3057\u307e\u3057\u305f'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
