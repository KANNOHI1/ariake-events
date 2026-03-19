// packages/web/src/lib/timetableUtils.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { isHoliday, filterUpcoming, toMinutes } from './timetableUtils'

describe('toMinutes', () => {
  it('converts HH:MM to minutes since midnight', () => {
    expect(toMinutes('00:00')).toBe(0)
    expect(toMinutes('09:30')).toBe(570)
    expect(toMinutes('23:59')).toBe(1439)
  })
})

describe('isHoliday', () => {
  it('returns true for Saturday', () => {
    const sat = new Date('2026-03-21') // 土曜日
    expect(isHoliday(sat)).toBe(true)
  })

  it('returns true for Sunday', () => {
    const sun = new Date('2026-03-22') // 日曜日
    expect(isHoliday(sun)).toBe(true)
  })

  it('returns false for weekday', () => {
    const mon = new Date('2026-03-23') // 月曜日
    expect(isHoliday(mon)).toBe(false)
  })
})

describe('filterUpcoming', () => {
  it('returns departures at or after the given time', () => {
    const times = ['09:00', '09:30', '10:00', '10:30']
    expect(filterUpcoming(times, '09:30')).toEqual(['09:30', '10:00', '10:30'])
  })

  it('returns empty array when all times have passed', () => {
    const times = ['09:00', '09:30']
    expect(filterUpcoming(times, '23:00')).toEqual([])
  })

  it('returns all times when current time is before first departure', () => {
    const times = ['10:00', '10:30']
    expect(filterUpcoming(times, '06:00')).toEqual(['10:00', '10:30'])
  })
})
