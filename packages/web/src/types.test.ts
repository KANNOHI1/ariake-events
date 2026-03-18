import { describe, it, expect } from 'vitest'
import { FACILITIES, CATEGORIES } from './types'

describe('FACILITIES', () => {
  it('contains exactly 5 facilities in order', () => {
    expect(FACILITIES).toHaveLength(5)
    expect(FACILITIES[0]).toBe('有明ガーデン')
    expect(FACILITIES[1]).toBe('東京ガーデンシアター')
    expect(FACILITIES[2]).toBe('有明アリーナ')
    expect(FACILITIES[3]).toBe('TOYOTA ARENA TOKYO')
    expect(FACILITIES[4]).toBe('東京ビッグサイト')
  })
})

describe('CATEGORIES', () => {
  it('contains exactly 8 categories', () => {
    expect(CATEGORIES).toHaveLength(8)
    expect(CATEGORIES).toContain('music')
    expect(CATEGORIES).toContain('sports')
    expect(CATEGORIES).toContain('exhibition')
    expect(CATEGORIES).toContain('kids')
    expect(CATEGORIES).toContain('food')
    expect(CATEGORIES).toContain('fashion')
    expect(CATEGORIES).toContain('anime')
    expect(CATEGORIES).toContain('other')
  })
})
