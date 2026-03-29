// packages/web/src/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventCard from './EventCard'
import type { EventItem } from '../types'

const musicEvent: EventItem = {
  id: 'test-001',
  eventName: 'テストコンサート',
  facility: '有明アリーナ',
  category: 'music',
  startDate: '2026-03-20',
  endDate: '2026-03-21',
  sourceURL: 'https://example.com/event',
  lastUpdated: '2026-03-18',
}

describe('EventCard', () => {
  // 1. カード全体がリンク
  it('カード全体が sourceURL へのリンクになっている', () => {
    render(<EventCard event={musicEvent} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/event')
    expect(link).toHaveAttribute('target', '_blank')
  })

  // 2. 施設バッジ
  it('施設バッジが表示される', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByText('有明アリーナ')).toBeInTheDocument()
  })

  // 3. カテゴリバッジ（日本語ラベル）
  it('カテゴリバッジが日本語ラベルで表示される', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByText('ミュージック')).toBeInTheDocument()
  })

  // 4. 混雑バッジ非表示（congestionRisk=0）
  it('congestionRisk=0 のとき混雑バッジが表示されない', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: 0 }} />)
    expect(screen.queryByText('空いている')).toBeNull()
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
    expect(screen.queryByText('非常に混雑')).toBeNull()
  })

  // 5. 混雑バッジ表示（congestionRisk=0.5）
  it('congestionRisk=0.5 のとき「やや混雑」バッジが表示される', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: 0.5 }} />)
    expect(screen.getByText('やや混雑')).toBeInTheDocument()
  })

  // 6. other カテゴリ + 施設あり: 施設画像を表示
  it('other カテゴリのとき施設画像（Unsplash URL）を表示する', () => {
    const otherEvent: EventItem = { ...musicEvent, category: 'other' }
    render(<EventCard event={otherEvent} />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('images.unsplash.com')
  })

  // 7. 非 other カテゴリ: img の src が Unsplash URL
  it('music カテゴリのとき img src が images.unsplash.com を含む', () => {
    render(<EventCard event={musicEvent} />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('images.unsplash.com')
  })

  // 8. congestionRisk=null のときバッジが表示されない
  it('congestionRisk が null のとき混雑バッジが表示されない', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: null }} />)
    expect(screen.queryByText('空いている')).toBeNull()
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
    expect(screen.queryByText('非常に混雑')).toBeNull()
  })
})
