import { describe, it, expect } from 'vitest'
import { getImageUrl, getFacilityPhoto } from './imageMap'
import type { EventItem } from '../types'

const baseEvent: EventItem = {
  id: 'test-001',
  eventName: 'テストイベント',
  facility: '有明アリーナ',
  category: 'music',
  startDate: '2026-04-01',
  endDate: '2026-04-01',
  sourceURL: 'https://example.com',
  lastUpdated: '2026-03-30',
}

describe('getImageUrl', () => {
  it('imageUrl があればそれを返す', () => {
    const event = { ...baseEvent, imageUrl: 'https://example.com/photo.jpg' }
    expect(getImageUrl(event)).toBe('https://example.com/photo.jpg')
  })

  it('imageUrl が null なら施設写真を返す', () => {
    const event = { ...baseEvent, imageUrl: null }
    expect(getImageUrl(event)).toBe('/facilities/ariake-arena.jpg')
  })

  it('imageUrl が undefined なら施設写真を返す', () => {
    expect(getImageUrl(baseEvent)).toBe('/facilities/ariake-arena.jpg')
  })

  it('TOYOTA ARENA の施設写真パスを返す', () => {
    const event = { ...baseEvent, facility: 'TOYOTA ARENA TOKYO' as const }
    expect(getImageUrl(event)).toBe('/facilities/toyota-arena.jpg')
  })

  it('東京ビッグサイトの施設写真パスを返す', () => {
    const event = { ...baseEvent, facility: '東京ビッグサイト' as const }
    expect(getImageUrl(event)).toBe('/facilities/tokyo-bigsight.jpg')
  })
})

describe('getFacilityPhoto', () => {
  it('各施設の写真パスを返す', () => {
    expect(getFacilityPhoto('有明ガーデン')).toBe('/facilities/ariake-garden.jpg')
    expect(getFacilityPhoto('東京ガーデンシアター')).toBe('/facilities/tokyo-garden-theater.webp')
    expect(getFacilityPhoto('有明アリーナ')).toBe('/facilities/ariake-arena.jpg')
    expect(getFacilityPhoto('TOYOTA ARENA TOKYO')).toBe('/facilities/toyota-arena.jpg')
    expect(getFacilityPhoto('東京ビッグサイト')).toBe('/facilities/tokyo-bigsight.jpg')
  })
})
