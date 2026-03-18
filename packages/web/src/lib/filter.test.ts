import { describe, it, expect } from 'vitest'
import {
  getDefaultFilters,
  filterEvents,
  parseFiltersFromParams,
  filtersToParams,
} from './filter'
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
  it('returns null for both facility and category (show all)', () => {
    const filters = getDefaultFilters()
    expect(filters.facility).toBeNull()
    expect(filters.category).toBeNull()
  })
})

describe('filterEvents', () => {
  const events: EventItem[] = [
    makeEvent({ id: '1', facility: '有明ガーデン', category: 'music', startDate: '2026-03-18', endDate: '2026-03-18' }),
    makeEvent({ id: '2', facility: '有明アリーナ', category: 'sports', startDate: '2026-03-19', endDate: '2026-03-19' }),
    makeEvent({ id: '3', facility: '東京ビッグサイト', category: 'exhibition', startDate: '2026-03-20', endDate: '2026-03-22' }),
    makeEvent({ id: '4', facility: '有明ガーデン', category: 'kids', startDate: '2026-03-25', endDate: '2026-03-25' }),
  ]

  it('returns all events in range when no filter applied', () => {
    const result = filterEvents(events, { facility: null, category: null }, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(3) // event 4 is outside range
  })

  it('filters by facility', () => {
    const result = filterEvents(events, { facility: '有明ガーデン', category: null }, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by category', () => {
    const result = filterEvents(events, { facility: null, category: 'sports' }, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by both facility and category', () => {
    const result = filterEvents(events, { facility: '有明ガーデン', category: 'music' }, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns empty when facility+category combination has no match', () => {
    const result = filterEvents(events, { facility: '有明ガーデン', category: 'sports' }, '2026-03-18', '2026-03-24')
    expect(result).toHaveLength(0)
  })

  it('filters by date range', () => {
    const result = filterEvents(events, { facility: null, category: null }, '2026-03-25', '2026-03-31')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('4')
  })
})

describe('parseFiltersFromParams', () => {
  it('returns default filters when params are empty', () => {
    const filters = parseFiltersFromParams(new URLSearchParams())
    expect(filters.facility).toBeNull()
    expect(filters.category).toBeNull()
  })

  it('parses facility key to Japanese name', () => {
    const filters = parseFiltersFromParams(new URLSearchParams('facility=ariakeGarden'))
    expect(filters.facility).toBe('有明ガーデン')
  })

  it('parses category value', () => {
    const filters = parseFiltersFromParams(new URLSearchParams('category=music'))
    expect(filters.category).toBe('music')
  })

  it('returns null for unknown facility key', () => {
    const filters = parseFiltersFromParams(new URLSearchParams('facility=unknownFacility'))
    expect(filters.facility).toBeNull()
  })

  it('returns null for invalid category', () => {
    const filters = parseFiltersFromParams(new URLSearchParams('category=invalid'))
    expect(filters.category).toBeNull()
  })

  it('parses both facility and category', () => {
    const filters = parseFiltersFromParams(new URLSearchParams('facility=ariakeArena&category=sports'))
    expect(filters.facility).toBe('有明アリーナ')
    expect(filters.category).toBe('sports')
  })
})

describe('filtersToParams', () => {
  it('returns empty string for default filters', () => {
    expect(filtersToParams({ facility: null, category: null })).toBe('')
  })

  it('returns facility param when facility is set', () => {
    const result = filtersToParams({ facility: '有明ガーデン', category: null })
    expect(result).toContain('facility=ariakeGarden')
  })

  it('returns category param when category is set', () => {
    const result = filtersToParams({ facility: null, category: 'music' })
    expect(result).toContain('category=music')
  })

  it('returns both params when both are set', () => {
    const result = filtersToParams({ facility: '有明アリーナ', category: 'sports' })
    expect(result).toContain('facility=ariakeArena')
    expect(result).toContain('category=sports')
  })
})
