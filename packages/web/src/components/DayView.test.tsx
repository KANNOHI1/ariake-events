import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import DayView from './DayView'
import type { EventItem } from '../types'
import { FACILITIES } from '../types'

vi.mock('../lib/dateUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/dateUtils')>()
  return {
    ...actual,
    getTodayString: () => '2026-04-05',
  }
})

const makeEvent = (overrides: Partial<EventItem>): EventItem => ({
  id: 'e1',
  eventName: 'Test Event',
  facility: FACILITIES[0],
  category: 'music',
  startDate: '2026-04-05',
  endDate: '2026-04-05',
  sourceURL: 'https://example.com',
  lastUpdated: '2026-04-05',
  ...overrides,
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DayView', () => {
  it('renders events sorted by category priority (sortEvents)', () => {
    const events: EventItem[] = [
      makeEvent({ id: '1', category: 'sports', eventName: 'Event A' }),
      makeEvent({ id: '2', category: 'music',  eventName: 'Event B' }),
    ]

    render(<DayView events={events} onResetFilters={vi.fn()} viewMode="list" />)

    const cards = screen.getAllByRole('article')
    expect(cards[0]).toHaveTextContent('Event B') // music (priority 0) before sports (priority 1)
    expect(cards[1]).toHaveTextContent('Event A')
  })

  it('shows empty state with reset button when no events', () => {
    const onResetFilters = vi.fn()
    render(<DayView events={[]} onResetFilters={onResetFilters} viewMode="list" />)

    expect(screen.getByText('この日のイベントはありません')).toBeInTheDocument()
    fireEvent.click(screen.getByText('絞り込みをリセット'))
    expect(onResetFilters).toHaveBeenCalledTimes(1)
  })

  it('grid mode uses the responsive CSS grid layout', () => {
    const events: EventItem[] = [makeEvent({ id: '1' })]
    const { container } = render(<DayView events={events} onResetFilters={vi.fn()} viewMode="grid" />)

    const grid = container.querySelector('.grid.grid-cols-2')
    expect(grid).not.toBeNull()
    expect(grid).toHaveClass('lg:grid-cols-3', 'xl:grid-cols-4', 'gap-3', 'p-4')
  })

  it('filters events to show only those matching the selected date', () => {
    const events: EventItem[] = [
      makeEvent({ id: '1', eventName: 'Today Only', startDate: '2026-04-05', endDate: '2026-04-05' }),
      makeEvent({ id: '2', eventName: 'Tomorrow Only', startDate: '2026-04-06', endDate: '2026-04-06' }),
    ]
    render(<DayView events={events} onResetFilters={vi.fn()} viewMode="list" />)

    expect(screen.getByText('Today Only')).toBeInTheDocument()
    expect(screen.queryByText('Tomorrow Only')).not.toBeInTheDocument()
  })

  it('navigates to next day on 次の日 click', () => {
    const events: EventItem[] = [
      makeEvent({ id: '1', eventName: 'Tomorrow Event', startDate: '2026-04-06', endDate: '2026-04-06' }),
    ]
    render(<DayView events={events} onResetFilters={vi.fn()} viewMode="list" />)

    expect(screen.queryByText('Tomorrow Event')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '次の日' }))
    expect(screen.getByText('Tomorrow Event')).toBeInTheDocument()
  })

  it('navigates to previous day on 前の日 click', () => {
    const events: EventItem[] = [
      makeEvent({ id: '1', eventName: 'Yesterday Event', startDate: '2026-04-04', endDate: '2026-04-04' }),
    ]
    render(<DayView events={events} onResetFilters={vi.fn()} viewMode="list" />)

    expect(screen.queryByText('Yesterday Event')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '前の日' }))
    expect(screen.getByText('Yesterday Event')).toBeInTheDocument()
  })

  it('hides 今日 button when on today', () => {
    render(<DayView events={[makeEvent({ id: '1' })]} onResetFilters={vi.fn()} viewMode="list" />)
    expect(screen.queryByRole('button', { name: '今日' })).not.toBeInTheDocument()
  })

  it('shows 今日 button when navigated away from today', () => {
    render(<DayView events={[]} onResetFilters={vi.fn()} viewMode="list" />)
    fireEvent.click(screen.getByRole('button', { name: '次の日' }))
    expect(screen.getByRole('button', { name: '今日' })).toBeInTheDocument()
  })

  it('clicking 今日 button returns to today', () => {
    render(<DayView events={[makeEvent({ id: '1' })]} onResetFilters={vi.fn()} viewMode="list" />)
    fireEvent.click(screen.getByRole('button', { name: '次の日' }))
    expect(screen.queryByRole('button', { name: '今日' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '今日' }))
    expect(screen.queryByRole('button', { name: '今日' })).not.toBeInTheDocument()
  })
})
