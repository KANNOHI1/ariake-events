import { FACILITIES, CATEGORIES, type EventCategory, type EventItem } from '../types'
import { isInRange } from './dateUtils'

export interface FilterState {
  facilities: string[]
  categories: EventCategory[]
}

/** Default state: all facilities and categories selected */
export function getDefaultFilters(): FilterState {
  return {
    facilities: [...FACILITIES],
    categories: [...CATEGORIES],
  }
}

/** Filter events by facility, category, and date range */
export function filterEvents(
  events: EventItem[],
  filters: FilterState,
  rangeStart: string,
  rangeEnd: string
): EventItem[] {
  return events.filter((e) => {
    if (!filters.facilities.includes(e.facility)) return false
    if (!filters.categories.includes(e.category)) return false
    if (!isInRange(e.startDate, e.endDate, rangeStart, rangeEnd)) return false
    return true
  })
}

/**
 * Parse FilterState from URL search params.
 * e.g. ?facility=ariakeGarden,ariakeArena&category=music,sports
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

  const facilities = facilityParam
    ? facilityParam
        .split(',')
        .map((k) => FACILITY_KEY_MAP[k])
        .filter(Boolean)
    : [...FACILITIES]

  const validCategories = new Set<EventCategory>(CATEGORIES)
  const categories = categoryParam
    ? (categoryParam
        .split(',')
        .filter((c): c is EventCategory => validCategories.has(c as EventCategory)))
    : [...CATEGORIES]

  return { facilities, categories }
}

/**
 * Serialize FilterState to URL search params string.
 * Returns empty string if state equals default (all selected).
 */
export function filtersToParams(filters: FilterState): string {
  const allFacilitiesSelected =
    filters.facilities.length === FACILITIES.length &&
    FACILITIES.every((f) => filters.facilities.includes(f))
  const allCategoriesSelected =
    filters.categories.length === CATEGORIES.length &&
    CATEGORIES.every((c) => filters.categories.includes(c))

  if (allFacilitiesSelected && allCategoriesSelected) return ''

  const params = new URLSearchParams()

  if (!allFacilitiesSelected) {
    const keys = filters.facilities
      .map((name) => FACILITY_NAME_TO_KEY[name])
      .filter(Boolean)
    if (keys.length > 0) params.set('facility', keys.join(','))
  }

  if (!allCategoriesSelected) {
    if (filters.categories.length > 0) params.set('category', filters.categories.join(','))
  }

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}
