import { describe, it, expect, vi, afterEach } from 'vitest'
import { getTodayString, toDateStr, getWeekRange, isInRange } from './dateUtils'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getTodayString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = getTodayString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns the mocked date when Date is mocked', () => {
    vi.setSystemTime(new Date('2026-03-18T10:00:00+09:00'))
    const result = getTodayString()
    expect(result).toBe('2026-03-18')
  })
})

describe('toDateStr', () => {
  it('formats a Date object as YYYY-MM-DD using local components', () => {
    const d = new Date(2026, 2, 5) // March 5, 2026 (month is 0-indexed)
    expect(toDateStr(d)).toBe('2026-03-05')
  })

  it('pads single-digit month and day', () => {
    const d = new Date(2026, 0, 9) // Jan 9
    expect(toDateStr(d)).toBe('2026-01-09')
  })
})

describe('getWeekRange', () => {
  it('returns a range from today to today+6', () => {
    const { start, end } = getWeekRange('2026-03-18')
    expect(start).toBe('2026-03-18')
    expect(end).toBe('2026-03-24')
  })

  it('handles month boundary correctly', () => {
    const { start, end } = getWeekRange('2026-03-29')
    expect(start).toBe('2026-03-29')
    expect(end).toBe('2026-04-04')
  })
})

describe('isInRange', () => {
  it('returns true when event fully within range', () => {
    expect(isInRange('2026-03-19', '2026-03-21', '2026-03-18', '2026-03-24')).toBe(true)
  })

  it('returns true when event starts before range and ends within', () => {
    expect(isInRange('2026-03-15', '2026-03-20', '2026-03-18', '2026-03-24')).toBe(true)
  })

  it('returns true when event starts within range and ends after', () => {
    expect(isInRange('2026-03-22', '2026-03-28', '2026-03-18', '2026-03-24')).toBe(true)
  })

  it('returns true when event spans entire range', () => {
    expect(isInRange('2026-03-01', '2026-03-31', '2026-03-18', '2026-03-24')).toBe(true)
  })

  it('returns false when event ends before range starts', () => {
    expect(isInRange('2026-03-10', '2026-03-17', '2026-03-18', '2026-03-24')).toBe(false)
  })

  it('returns false when event starts after range ends', () => {
    expect(isInRange('2026-03-25', '2026-03-28', '2026-03-18', '2026-03-24')).toBe(false)
  })

  it('returns true for single-day event on range boundary', () => {
    expect(isInRange('2026-03-18', '2026-03-18', '2026-03-18', '2026-03-24')).toBe(true)
    expect(isInRange('2026-03-24', '2026-03-24', '2026-03-18', '2026-03-24')).toBe(true)
  })
})
