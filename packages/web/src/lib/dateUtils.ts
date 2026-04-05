/**
 * Returns today's date as "YYYY-MM-DD" in JST (Asia/Tokyo).
 * Uses toLocaleDateString('sv-SE') which outputs ISO 8601 format.
 */
export function getTodayString(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
}

/**
 * Converts a Date object to "YYYY-MM-DD" using local time components.
 * Do NOT use toISOString() — it returns UTC and can be off by one day in JST.
 */
export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Returns the date range for "this week": today through 6 days later.
 * Both start and end are "YYYY-MM-DD" strings in JST.
 */
export function getWeekRange(today: string): { start: string; end: string } {
  const start = today
  const d = new Date(today + 'T00:00:00')
  d.setDate(d.getDate() + 6)
  const end = toDateStr(d)
  return { start, end }
}

/**
 * Returns a new "YYYY-MM-DD" string offset by the given number of days.
 * Uses T00:00:00 suffix to avoid UTC interpretation (same pattern as getWeekRange).
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}

/**
 * Formats a "YYYY-MM-DD" string as a Japanese date label (e.g. "2026年4月5日(日)").
 * Uses Asia/Tokyo timezone for consistency with getTodayString().
 */
export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Tokyo',
  })
}

/**
 * Returns true if an event's date range overlaps with the given range.
 * An event is "in range" if: startDate <= rangeEnd AND endDate >= rangeStart
 */
export function isInRange(
  eventStart: string,
  eventEnd: string,
  rangeStart: string,
  rangeEnd: string
): boolean {
  return eventStart <= rangeEnd && eventEnd >= rangeStart
}
