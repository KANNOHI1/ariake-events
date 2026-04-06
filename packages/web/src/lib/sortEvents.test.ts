import { describe, it, expect } from 'vitest'
import { sortEvents } from './sortEvents'
import type { EventItem } from '../types'

function makeEvent(overrides: Partial<EventItem> & { category: EventItem['category'] }): EventItem {
  return {
    id: 'test-id',
    eventName: 'Test Event',
    facility: '東京ビッグサイト',
    startDate: '2026-04-10',
    endDate: '2026-04-10',
    sourceURL: 'https://example.com',
    lastUpdated: '2026-04-07T00:00:00Z',
    congestionRisk: null,
    imageUrl: null,
    ...overrides,
  }
}

describe('sortEvents', () => {
  it('music は other より前に来る', () => {
    const events = [
      makeEvent({ id: 'b', category: 'other', eventName: 'Other Event' }),
      makeEvent({ id: 'a', category: 'music', eventName: 'Music Event' }),
    ]
    const result = sortEvents(events)
    expect(result[0].category).toBe('music')
    expect(result[1].category).toBe('other')
  })

  it('music は sports より前に来る', () => {
    const events = [
      makeEvent({ id: 'b', category: 'sports' }),
      makeEvent({ id: 'a', category: 'music' }),
    ]
    const result = sortEvents(events)
    expect(result[0].category).toBe('music')
  })

  it('4日以上開催のイベントは同カテゴリの短期イベントより後に来る', () => {
    const events = [
      makeEvent({ id: 'long', category: 'music', startDate: '2026-04-10', endDate: '2026-04-13' }), // 4日
      makeEvent({ id: 'short', category: 'music', startDate: '2026-04-10', endDate: '2026-04-10' }), // 1日
    ]
    const result = sortEvents(events)
    expect(result[0].id).toBe('short')
    expect(result[1].id).toBe('long')
  })

  it('3日開催はペナルティなし（4日未満）', () => {
    const events = [
      makeEvent({ id: 'three', category: 'other', startDate: '2026-04-10', endDate: '2026-04-12' }), // 3日
      makeEvent({ id: 'music', category: 'music', startDate: '2026-04-10', endDate: '2026-04-10' }),
    ]
    const result = sortEvents(events)
    expect(result[0].category).toBe('music')
  })

  it('スコアが同じ場合は startDate 昇順になる', () => {
    const events = [
      makeEvent({ id: 'later', category: 'sports', startDate: '2026-04-15', endDate: '2026-04-15' }),
      makeEvent({ id: 'earlier', category: 'sports', startDate: '2026-04-10', endDate: '2026-04-10' }),
    ]
    const result = sortEvents(events)
    expect(result[0].id).toBe('earlier')
  })

  it('元の配列を変更しない（immutable）', () => {
    const events = [
      makeEvent({ id: 'b', category: 'other' }),
      makeEvent({ id: 'a', category: 'music' }),
    ]
    const original = [...events]
    const result = sortEvents(events)
    expect(result).not.toBe(events)
    expect(events[0].id).toBe(original[0].id)
  })

  it('空配列を渡すと空配列を返す', () => {
    expect(sortEvents([])).toEqual([])
  })
})
