import type { DirectionSchedule } from '../data/timetable'

export type DayType = 'weekday' | 'saturday' | 'holiday'

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function getDayType(date: Date = new Date()): DayType {
  const day = date.getDay()
  if (day === 6) return 'saturday'
  if (day === 0) return 'holiday'
  return 'weekday'
}

export function getSchedule(dir: DirectionSchedule, dayType: DayType): string[] {
  if (dayType === 'saturday') return dir.saturday ?? dir.holiday
  if (dayType === 'holiday') return dir.holiday
  return dir.weekday
}

export function filterUpcoming(departures: string[], currentTime: string): string[] {
  const currentMinutes = toMinutes(currentTime)
  return departures.filter((t) => toMinutes(t) >= currentMinutes)
}

export function isHoliday(date: Date = new Date()): boolean {
  return getDayType(date) !== 'weekday'
}
