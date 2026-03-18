import { FACILITIES, CATEGORIES, type EventCategory, type EventItem } from '../types'
import { isInRange } from './dateUtils'

export interface FilterState {
  facility: string | null     // null = すべての施設
  category: EventCategory | null  // null = すべてのカテゴリ
}

/** Default state: no filter applied (show all) */
export function getDefaultFilters(): FilterState {
  return { facility: null, category: null }
}

/** Filter events by facility, category, and date range */
export function filterEvents(
  events: EventItem[],
  filters: FilterState,
  rangeStart: string,
  rangeEnd: string
): EventItem[] {
  return events.filter((e) => {
    if (filters.facility !== null && e.facility !== filters.facility) return false
    if (filters.category !== null && e.category !== filters.category) return false
    if (!isInRange(e.startDate, e.endDate, rangeStart, rangeEnd)) return false
    return true
  })
}

/**
 * Parse FilterState from URL search params.
 * e.g. ?facility=ariakeGarden&category=music
 *
 * Note: URL params use facility keys (e.g. 'ariakeGarden') but EventItem.facility
 * stores Japanese names (e.g. '有明ガーデン'). This mapping is applied here.
 */
const FACILITY_KEY_MAP: Record<string, string> = {
  ariakeGarden: '有明ガーデン',
  tokyoGardenTheatre: '東京ガーデンシアター',
  ariakeArena: '有明アリーナ',
  toyotaArenaTokyo: 'TOYOTA ARENA TOKYO',
  tokyoBigSight: '東京ビッグサイト',
}

const FACILITY_NAME_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(FACILITY_KEY_MAP).map(([k, v]) => [v, k])
)

export function parseFiltersFromParams(params: URLSearchParams): FilterState {
  const facilityParam = params.get('facility')
  const categoryParam = params.get('category')

  const facility = facilityParam ? (FACILITY_KEY_MAP[facilityParam] ?? null) : null

  const validCategories = new Set<EventCategory>(CATEGORIES)
  const category =
    categoryParam && validCategories.has(categoryParam as EventCategory)
      ? (categoryParam as EventCategory)
      : null

  return { facility, category }
}

/**
 * Serialize FilterState to URL search params string.
 * Returns empty string if default (no filter applied).
 */
export function filtersToParams(filters: FilterState): string {
  if (filters.facility === null && filters.category === null) return ''

  const params = new URLSearchParams()

  if (filters.facility !== null) {
    const key = FACILITY_NAME_TO_KEY[filters.facility]
    if (key) params.set('facility', key)
  }

  if (filters.category !== null) {
    params.set('category', filters.category)
  }

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}
