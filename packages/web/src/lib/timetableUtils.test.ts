// packages/web/src/lib/timetableUtils.test.ts
import { describe, it, expect } from 'vitest'
import type { DirectionSchedule } from '../data/timetable'
import { getDayType, getSchedule, isHoliday, filterUpcoming, toMinutes } from './timetableUtils'

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

describe('getDayType', () => {
  it('returns weekday on Monday', () => {
    expect(getDayType(new Date('2026-04-06'))).toBe('weekday')
  })

  it('returns saturday on Saturday', () => {
    expect(getDayType(new Date('2026-04-11'))).toBe('saturday')
  })

  it('returns holiday on Sunday', () => {
    expect(getDayType(new Date('2026-04-12'))).toBe('holiday')
  })
})

describe('getSchedule', () => {
  const dir: DirectionSchedule = {
    label: 'test',
    weekday: ['09:00', '10:00'],
    saturday: ['09:30', '10:30'],
    holiday: ['10:00', '11:00'],
  }

  it('returns weekday schedule on weekday', () => {
    expect(getSchedule(dir, 'weekday')).toEqual(['09:00', '10:00'])
  })

  it('returns saturday schedule on saturday', () => {
    expect(getSchedule(dir, 'saturday')).toEqual(['09:30', '10:30'])
  })

  it('returns holiday schedule on holiday', () => {
    expect(getSchedule(dir, 'holiday')).toEqual(['10:00', '11:00'])
  })

  it('falls back to holiday when saturday field is absent', () => {
    const noSat: DirectionSchedule = {
      label: 'test',
      weekday: ['09:00'],
      holiday: ['10:00'],
    }

    expect(getSchedule(noSat, 'saturday')).toEqual(['10:00'])
  })
})
