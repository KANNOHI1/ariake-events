export type EventCategory =
  | 'music'
  | 'sports'
  | 'exhibition'
  | 'kids'
  | 'food'
  | 'fashion'
  | 'anime'
  | 'other'

export const FACILITIES = [
  '有明ガーデン',
  '東京ガーデンシアター',
  '有明アリーナ',
  'TOYOTA ARENA TOKYO',
  '東京ビッグサイト',
] as const

export type FacilityName = (typeof FACILITIES)[number]

export const CATEGORIES: EventCategory[] = [
  'music',
  'sports',
  'exhibition',
  'kids',
  'food',
  'fashion',
  'anime',
  'other',
]

export interface EventItem {
  id: string
  eventName: string
  facility: FacilityName
  category: EventCategory
  startDate: string  // "YYYY-MM-DD"
  endDate: string    // "YYYY-MM-DD"
  sourceURL: string
  lastUpdated: string
  peakTimeStart?: null
  peakTimeEnd?: null
  estimatedAttendees?: null
  congestionRisk?: null
}
