import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import WeekView from './WeekView'
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

describe('WeekView', () => {
  it('renders events sorted by startDate ascending', () => {
    const events: EventItem[] = [
      makeEvent({ id: '1', startDate: '2026-03-22', endDate: '2026-03-22', eventName: 'Later Event' }),
      makeEvent({ id: '2', startDate: '2026-03-18', endDate: '2026-03-18', eventName: 'Earlier Event' }),
    ]
    render(<WeekView events={events} onResetFilters={vi.fn()} />)
    const cards = screen.getAllByRole('article')
    expect(cards[0]).toHaveTextContent('Earlier Event')
    expect(cards[1]).toHaveTextContent('Later Event')
  })

  it('shows empty state when no events', () => {
    render(<WeekView events={[]} onResetFilters={vi.fn()} />)
    expect(screen.getByText('条件に一致するイベントがありません')).toBeInTheDocument()
    expect(screen.getByText('フィルタをリセット')).toBeInTheDocument()
  })

  it('calls onResetFilters when reset button clicked', () => {
    const onResetFilters = vi.fn()
    render(<WeekView events={[]} onResetFilters={onResetFilters} />)
    fireEvent.click(screen.getByText('フィルタをリセット'))
    expect(onResetFilters).toHaveBeenCalledTimes(1)
  })
})
