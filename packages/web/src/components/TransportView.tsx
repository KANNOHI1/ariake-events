// packages/web/src/components/TransportView.tsx
'use client'

import { useMemo, useState, useEffect } from 'react'
import { timetable } from '../data/timetable'
import { isHoliday, filterUpcoming } from '../lib/timetableUtils'

function getNowString(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default function TransportView() {
  // 1分ごとに再レンダリングして時刻フィルタを最新に保つ
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
          upcoming: filterUpcoming(
            holiday ? dir.holiday : dir.weekday,
            now
          ),
        })),
      })),
    [now, holiday]
  )

  return (
    <div className="p-4">
      <p className="text-xs text-slate-500 mb-3">
        {now} 以降の発車便 · {holiday ? '土休日' : '平日'}ダイヤ
      </p>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="border-collapse text-sm whitespace-nowrap">
          {/* 路線名（上位ヘッダー） */}
          <thead>
            <tr>
              {routes.map((route) => (
                <th
                  key={route.name}
                  colSpan={route.directions.length}
                  className="px-3 py-2 text-center font-bold bg-slate-800 text-white border border-slate-600"
                >
                  {route.name}
                </th>
              ))}
            </tr>

            {/* 最寄り駅 */}
            <tr>
              {routes.map((route) => (
                <td
                  key={route.name}
                  colSpan={route.directions.length}
                  className="px-3 py-1 text-center text-xs text-slate-400 bg-slate-900 border border-slate-700"
                >
                  {route.station}
                </td>
              ))}
            </tr>

            {/* 徒歩分数 */}
            <tr>
              {routes.map((route) => (
                <td
                  key={route.name}
                  colSpan={route.directions.length}
                  className="px-3 py-1 text-center text-xs text-slate-500 bg-slate-900 border border-slate-700"
                >
                  徒歩{route.walkMinutes}分
                </td>
              ))}
            </tr>

            {/* 方面名（下位ヘッダー） */}
            <tr>
              {routes.flatMap((route) =>
                route.directions.map((dir) => (
                  <th
                    key={`${route.name}-${dir.label}`}
                    className="px-3 py-1.5 text-center text-xs font-medium bg-slate-700 text-slate-200 border border-slate-600"
                  >
                    {dir.label}
                  </th>
                ))
              )}
            </tr>
          </thead>

          {/* 時刻データ */}
          <tbody>
            {Array.from({
              length: Math.max(0, ...routes.flatMap((r) => r.directions.map((d) => d.upcoming.length))),
            }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                {routes.flatMap((route) =>
                  route.directions.map((dir) => (
                    <td
                      key={`${route.name}-${dir.label}-${rowIndex}`}
                      className="px-4 py-1.5 text-center border border-slate-200 text-slate-700 tabular-nums"
                    >
                      {dir.upcoming[rowIndex] ?? ''}
                    </td>
                  ))
                )}
              </tr>
            ))}
            {routes.every((r) => r.directions.every((d) => d.upcoming.length === 0)) && (
              <tr>
                <td
                  colSpan={routes.reduce((sum, r) => sum + r.directions.length, 0)}
                  className="px-4 py-8 text-center text-slate-400 text-sm"
                >
                  本日の運行は終了しました
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
