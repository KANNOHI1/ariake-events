import type { EventItem, EventCategory } from '../types'

const CATEGORY_PRIORITY: Record<EventCategory, number> = {
  music:      0,
  sports:     1,
  kids:       2,
  anime:      2,
  food:       3,
  fashion:    3,
  exhibition: 4,
  other:      5,
}

const LONG_RUN_DAYS = 4
const LONG_RUN_PENALTY = 10

function getDurationDays(startDate: string, endDate: string): number {
  const [sy, sm, sd] = startDate.split('-').map(Number)
  const [ey, em, ed] = endDate.split('-').map(Number)
  const start = Date.UTC(sy, sm - 1, sd)
  const end   = Date.UTC(ey, em - 1, ed)
  return (end - start) / (1000 * 60 * 60 * 24) + 1
}

function eventSortScore(event: EventItem): number {
  const categoryScore = CATEGORY_PRIORITY[event.category] ?? 5
  const durationPenalty =
    getDurationDays(event.startDate, event.endDate) >= LONG_RUN_DAYS
      ? LONG_RUN_PENALTY
      : 0
  return categoryScore + durationPenalty
}

export function sortEvents(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    const scoreDiff = eventSortScore(a) - eventSortScore(b)
    if (scoreDiff !== 0) return scoreDiff
    return a.startDate.localeCompare(b.startDate)
  })
}
