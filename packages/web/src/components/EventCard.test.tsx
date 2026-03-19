import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventCard from './EventCard'
import type { EventItem } from '../types'

const sampleEvent: EventItem = {
  id: 'test-1',
  eventName: 'テストコンサート',
  facility: '有明アリーナ',
  category: 'music',
  startDate: '2026-03-20',
  endDate: '2026-03-21',
  sourceURL: 'https://example.com/event',
  lastUpdated: '2026-03-18',
}

describe('EventCard', () => {
  it('renders event name', () => {
    render(<EventCard event={sampleEvent} />)
    expect(screen.getByText('テストコンサート')).toBeInTheDocument()
  })

  it('renders facility badge', () => {
    render(<EventCard event={sampleEvent} />)
    expect(screen.getByText('有明アリーナ')).toBeInTheDocument()
  })

  it('renders category tag with Japanese label', () => {
    render(<EventCard event={sampleEvent} />)
    expect(screen.getByText('ミュージック')).toBeInTheDocument()
  })

  it('renders date range when start and end differ', () => {
    render(<EventCard event={sampleEvent} />)
    expect(screen.getByText('2026-03-20 〜 2026-03-21')).toBeInTheDocument()
  })

  it('renders single date when start equals end', () => {
    render(<EventCard event={{ ...sampleEvent, startDate: '2026-03-20', endDate: '2026-03-20' }} />)
    expect(screen.getByText('2026-03-20')).toBeInTheDocument()
  })

  it('renders link to official site', () => {
    render(<EventCard event={sampleEvent} />)
    const link = screen.getByRole('link', { name: /公式サイト/ })
    expect(link).toHaveAttribute('href', 'https://example.com/event')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders facility badge with sky color class for 有明アリーナ', () => {
    render(<EventCard event={sampleEvent} />)
    const badge = screen.getByText('有明アリーナ')
    expect(badge.className).toContain('bg-sky-50')
  })

  it('congestionRisk が 0.5 のとき「やや混雑」バッジを表示する', () => {
    render(<EventCard event={{ ...sampleEvent, congestionRisk: 0.5 }} />)
    expect(screen.getByText('やや混雑')).toBeInTheDocument()
  })

  it('congestionRisk が 0.1 のとき「空いている」バッジを表示する', () => {
    render(<EventCard event={{ ...sampleEvent, congestionRisk: 0.1 }} />)
    expect(screen.getByText('空いている')).toBeInTheDocument()
  })

  it('congestionRisk が null のときバッジを表示しない', () => {
    render(<EventCard event={{ ...sampleEvent, congestionRisk: null }} />)
    expect(screen.queryByText('空いている')).toBeNull()
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
    expect(screen.queryByText('非常に混雑')).toBeNull()
  })

  it('congestionRisk が 0 のときバッジを表示しない', () => {
    render(<EventCard event={{ ...sampleEvent, congestionRisk: 0 }} />)
    expect(screen.queryByText('空いている')).toBeNull()
  })
})
