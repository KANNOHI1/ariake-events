import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import TodayView from './TodayView'
import type { EventItem } from '../types'
import { FACILITIES } from '../types'

const makeEvent = (overrides: Partial<EventItem>): EventItem => ({
  id: 'e1',
  eventName: 'Test Event',
  facility: FACILITIES[0],
  category: 'music',
  startDate: '2026-03-18',
  endDate: '2026-03-18',
  sourceURL: 'https://example.com',
  lastUpdated: '2026-03-18',
  ...overrides,
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TodayView', () => {
  it('renders events sorted by facility order', () => {
    const events: EventItem[] = [
      makeEvent({ id: '1', facility: FACILITIES[4], eventName: 'Event A' }),
      makeEvent({ id: '2', facility: FACILITIES[0], eventName: 'Event B' }),
    ]

    render(<TodayView events={events} onResetFilters={vi.fn()} viewMode="list" />)

    const cards = screen.getAllByRole('article')
    expect(cards[0]).toHaveTextContent('Event B')
    expect(cards[1]).toHaveTextContent('Event A')
  })

  it('shows empty state and lets the user reset filters', () => {
    const onResetFilters = vi.fn()

    render(<TodayView events={[]} onResetFilters={onResetFilters} viewMode="list" />)

    fireEvent.click(screen.getByRole('button'))
    expect(onResetFilters).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('今日のイベント')).not.toBeInTheDocument()
  })

  it('grid mode uses the responsive 4-column masonry layout', () => {
    const events: EventItem[] = [makeEvent({ id: '1' })]
    const { container } = render(<TodayView events={events} onResetFilters={vi.fn()} viewMode="grid" />)

    const grid = container.querySelector('.columns-2')
    expect(grid).not.toBeNull()
    expect(grid).toHaveClass('lg:columns-3', 'xl:columns-4', 'gap-x-3', 'p-4')
  })

  it('shows section header with formatted today label when events exist', () => {
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('2026年3月18日(水)')

    render(<TodayView events={[makeEvent({ id: '1' })]} onResetFilters={vi.fn()} viewMode="list" />)

    expect(screen.getByText('今日のイベント')).toBeInTheDocument()
    expect(screen.getByText('2026年3月18日(水)')).toHaveClass('text-sm', 'text-slate-500')
  })
})
