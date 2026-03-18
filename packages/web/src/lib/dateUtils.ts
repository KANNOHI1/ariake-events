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
