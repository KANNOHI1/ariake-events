import { describe, it, expect } from 'vitest'
import { getCongestionInfo } from './colorMap'

describe('getCongestionInfo', () => {
  it('null を渡すと null を返す', () => {
    expect(getCongestionInfo(null)).toBeNull()
  })
  it('0 を渡すと null を返す', () => {
    expect(getCongestionInfo(0)).toBeNull()
  })
  it('undefined を渡すと null を返す', () => {
    expect(getCongestionInfo(undefined)).toBeNull()
  })
  it('0.1 → 空いている (emerald)', () => {
    const info = getCongestionInfo(0.1)
    expect(info).not.toBeNull()
    expect(info!.label).toBe('空いている')
    expect(info!.badgeClass).toContain('emerald')
    expect(info!.barClass).toContain('emerald')
  })
  it('0.3 → やや混雑 (amber)（境界値は上位レンジ）', () => {
    const info = getCongestionInfo(0.3)
    expect(info!.label).toBe('やや混雑')
    expect(info!.badgeClass).toContain('amber')
  })
  it('0.5 → やや混雑 (amber)', () => {
    const info = getCongestionInfo(0.5)
    expect(info!.label).toBe('やや混雑')
  })
  it('0.6 → 混雑 (orange)（境界値は上位レンジ）', () => {
    const info = getCongestionInfo(0.6)
    expect(info!.label).toBe('混雑')
    expect(info!.badgeClass).toContain('orange')
  })
  it('0.75 → 混雑 (orange)', () => {
    const info = getCongestionInfo(0.75)
    expect(info!.label).toBe('混雑')
  })
  it('0.8 → 非常に混雑 (rose)（境界値は上位レンジ）', () => {
    const info = getCongestionInfo(0.8)
    expect(info!.label).toBe('非常に混雑')
    expect(info!.badgeClass).toContain('rose')
  })
  it('1.0 → 非常に混雑 (rose)', () => {
    const info = getCongestionInfo(1.0)
    expect(info!.label).toBe('非常に混雑')
  })
})
