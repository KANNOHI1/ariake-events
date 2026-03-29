// packages/web/src/lib/imageMap.test.ts
import { describe, it, expect } from 'vitest'
import { getImageUrl } from './imageMap'

describe('getImageUrl', () => {
  it('music カテゴリで Unsplash URL を返す', () => {
    const url = getImageUrl('music', 'event-001')
    expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/)
  })

  it('同じ eventId は常に同じ URL を返す（決定論的）', () => {
    const url1 = getImageUrl('sports', 'abc')
    const url2 = getImageUrl('sports', 'abc')
    expect(url1).toBe(url2)
  })

  it('eventId が異なれば異なる URL が返りうる', () => {
    const urls = ['a', 'b', 'c'].map(id => getImageUrl('music', id))
    urls.forEach(url => {
      expect(url).toMatch(/images\.unsplash\.com/)
    })
  })

  it('other カテゴリは null を返す', () => {
    const url = getImageUrl('other', 'event-123')
    expect(url).toBeNull()
  })

  it('すべての非 other カテゴリで URL を返す', () => {
    const categories = ['music', 'sports', 'exhibition', 'kids', 'food', 'fashion', 'anime'] as const
    categories.forEach(cat => {
      const url = getImageUrl(cat, 'test')
      expect(url).not.toBeNull()
      expect(url).toMatch(/images\.unsplash\.com/)
    })
  })

  it('URL に ?w=300&h=200&fit=crop が含まれる', () => {
    const url = getImageUrl('music', 'test')
    expect(url).toContain('w=300')
    expect(url).toContain('h=200')
    expect(url).toContain('fit=crop')
  })
})
