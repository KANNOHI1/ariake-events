// packages/web/src/lib/timetableUtils.ts

/** "HH:MM" を深夜0時からの分数に変換 */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * 指定日が土休日かどうかを判定
 * ⚠️ 日本の祝日は考慮しない（土・日のみ判定）。
 * 祝日対応は別フェーズで date-holidays パッケージ等を使って追加可能。
 */
export function isHoliday(date: Date = new Date()): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0=日, 6=土
}

/** 現在時刻以降の発車時刻のみ返す */
export function filterUpcoming(
  departures: string[],
  currentTime: string
): string[] {
  const currentMinutes = toMinutes(currentTime)
  return departures.filter((t) => toMinutes(t) >= currentMinutes)
}
