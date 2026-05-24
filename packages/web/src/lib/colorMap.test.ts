import { describe, expect, it } from 'vitest'
import { getCongestionInfo } from './colorMap'

describe('getCongestionInfo', () => {
  it('returns null for nullish and zero-like values', () => {
    expect(getCongestionInfo(null)).toBeNull()
    expect(getCongestionInfo(undefined)).toBeNull()
    expect(getCongestionInfo(0)).toBeNull()
  })

  it('provides an imageBadgeClass for mid-range scores', () => {
    const info = getCongestionInfo(0.5)
    expect(info).not.toBeNull()
    expect(info?.imageBadgeClass).toBeTruthy()
  })

  it('uses emerald styles for low congestion', () => {
    const info = getCongestionInfo(0.1)
    expect(info?.badgeClass).toContain('emerald')
    expect(info?.barClass).toContain('emerald')
    expect(info?.imageBadgeClass).toContain('emerald')
  })

  it('uses amber styles for medium congestion', () => {
    const info = getCongestionInfo(0.5)
    expect(info?.badgeClass).toContain('amber')
    expect(info?.imageBadgeClass).toContain('amber')
  })

  it('uses orange styles for high congestion', () => {
    const info = getCongestionInfo(0.7)
    expect(info?.badgeClass).toContain('orange')
    expect(info?.imageBadgeClass).toContain('orange')
  })

  it('uses rose styles for very high congestion', () => {
    const info = getCongestionInfo(0.9)
    expect(info?.badgeClass).toContain('rose')
    expect(info?.imageBadgeClass).toContain('rose')
  })
})
