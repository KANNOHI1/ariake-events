import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodayView from './TodayView'
import type { EventItem } from '../types'

const makeEvent = (overrides: Partial<EventItem>): EventItem => ({
  id: 'e1',
  eventName: 'Test Event',
  facility: '有明ガーデン',
  category: 'music',
  startDate: '2026-03-18',
  endDate: '2026-03-18',
  sourceURL: 'https://example.com',
  lastUpdated: '2026-03-18',
  ...overrides,
})

describe('TodayView', () => {
  it('renders events sorted by facility order', () => {
    const events: EventItem[] = [
      makeEvent({ id: '1', facility: '東京ビッグサイト', eventName: 'Event A' }),
      makeEvent({ id: '2', facility: '有明ガーデン', eventName: 'Event B' }),
    ]
    render(<TodayView events={events} onResetFilters={vi.fn()} />)
    const cards = screen.getAllByRole('article')
    // 有明ガーデン (index 0) should come before 東京ビッグサイト (index 4)
    expect(cards[0]).toHaveTextContent('Event B')
    expect(cards[1]).toHaveTextContent('Event A')
  })

  it('shows empty state when no events', () => {
    render(<TodayView events={[]} onResetFilters={vi.fn()} />)
    expect(screen.getByText('条件に一致するイベントがありません')).toBeInTheDocument()
    expect(screen.getByText('フィルタをリセット')).toBeInTheDocument()
  })

  it('calls onResetFilters when reset button clicked', () => {
    const onResetFilters = vi.fn()
    render(<TodayView events={[]} onResetFilters={onResetFilters} />)
    fireEvent.click(screen.getByText('フィルタをリセット'))
    expect(onResetFilters).toHaveBeenCalledTimes(1)
  })
})
