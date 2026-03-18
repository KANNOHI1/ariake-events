import { describe, it, expect } from 'vitest'
import {
  getDefaultFilters,
  filterEvents,
  parseFiltersFromParams,
  filtersToParams,
} from './filter'
import { FACILITIES, CATEGORIES } from '../types'
import type { EventItem } from '../types'

const makeEvent = (overrides: Partial<EventItem>): EventItem => ({
  id: 'test-1',
  eventName: 'Test Event',
  facility: '有明ガーデン',
  category: 'music',
  startDate: '2026-03-18',
  endDate: '2026-03-18',
  sourceURL: 'https://example.com',
  lastUpdated: '2026-03-18',
  ...overrides,
})

describe('getDefaultFilters', () => {
  it('returns all facilities and categories selected', () => {
    const filters = getDefaultFilters()
    expect(filters.facilities).toHaveLength(FACILITIES.length)
    expect(filters.categories).toHaveLength(CATEGORIES.length)
    FACILITIES.forEach((f) => expect(filters.facilities).toContain(f))
    CATEGORIES.forEach((c) => expect(filters.categories).toContain(c))
  })
})

describe('filterEvents', () => {
  const events: EventItem[] = [
    makeEvent({ id: '1', facility: '有明ガーデン', category: 'music', startDate: '2026-03-18', endDate: '2026-03-18' }),
    makeEvent({ id: '2', facility: '有明アリーナ', category: 'sports', startDate: '2026-03-19', endDate: '2026-03-19' }),
    makeEvent({ id: '3', facility: '東京ビッグサイト', category: 'exhibition', startDate: '2026-03-20', endDate: '2026-03-22' }),
    makeEvent({ id: '4', facility: '有明ガーデン', category: 'kids', startDate: '2026-03-25', endDate: '2026-03-25' }),
  ]
  const defaultFilters = getDefaultFilters()

  it('returns all events when all filters selected', () => {
    const result = filterEvents(events, defaultFilters, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(3) // event 4 is outside range
  })

  it('filters by facility', () => {
    const filters = { ...defaultFilters, facilities: ['有明ガーデン'] }
    const result = filterEvents(events, filters, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by category', () => {
    const filters = { ...defaultFilters, categories: ['sports' as const] }
    const result = filterEvents(events, filters, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('returns empty when no facilities selected', () => {
    const filters = { ...defaultFilters, facilities: [] }
    const result = filterEvents(events, filters, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(0)
  })

  it('returns empty when no categories selected', () => {
    const filters = { ...defaultFilters, categories: [] }
    const result = filterEvents(events, filters, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(0)
  })

  it('filters by date range — excludes events outside range', () => {
    const result = filterEvents(events, defaultFilters, '2026-03-25', '2026-03-31')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('4')
  })
})

describe('parseFiltersFromParams', () => {
  it('returns default filters when params are empty', () => {
    const params = new URLSearchParams()
    const filters = parseFiltersFromParams(params)
    expect(filters.facilities).toHaveLength(FACILITIES.length)
    expect(filters.categories).toHaveLength(CATEGORIES.length)
  })

  it('parses facility keys to Japanese names', () => {
    const params = new URLSearchParams('facility=ariakeGarden,ariakeArena')
    const filters = parseFiltersFromParams(params)
    expect(filters.facilities).toContain('有明ガーデン')
    expect(filters.facilities).toContain('有明アリーナ')
    expect(filters.facilities).toHaveLength(2)
  })

  it('parses category values', () => {
    const params = new URLSearchParams('category=music,sports')
    const filters = parseFiltersFromParams(params)
    expect(filters.categories).toContain('music')
    expect(filters.categories).toContain('sports')
    expect(filters.categories).toHaveLength(2)
  })

  it('ignores invalid category values', () => {
    const params = new URLSearchParams('category=music,invalid_category')
    const filters = parseFiltersFromParams(params)
    expect(filters.categories).toEqual(['music'])
  })

  it('ignores unknown facility keys', () => {
    const params = new URLSearchParams('facility=ariakeGarden,unknownFacility')
    const filters = parseFiltersFromParams(params)
    expect(filters.facilities).toEqual(['有明ガーデン'])
  })
})

describe('filtersToParams', () => {
  it('returns empty string when all selected (default)', () => {
    const filters = getDefaultFilters()
    expect(filtersToParams(filters)).toBe('')
  })

  it('returns facility params when some facilities deselected', () => {
    const filters = getDefaultFilters()
    filters.facilities = ['有明ガーデン', '有明アリーナ']
    const result = filtersToParams(filters)
    expect(result).toContain('facility=')
    expect(result).toContain('ariakeGarden')
    expect(result).toContain('ariakeArena')
  })

  it('returns category params when some categories deselected', () => {
    const filters = getDefaultFilters()
    filters.categories = ['music', 'sports']
    const result = filtersToParams(filters)
    expect(result).toContain('category=music%2Csports')
  })

  it('returns empty string when all facilities deselected (no params)', () => {
    // When empty, params.set is not called, so result is ''
    const filters = getDefaultFilters()
    filters.facilities = []
    filters.categories = []
    const result = filtersToParams(filters)
    expect(result).toBe('')
  })
})
