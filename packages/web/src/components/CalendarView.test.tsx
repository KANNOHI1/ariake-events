import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CalendarView from './CalendarView'
import type { EventItem } from '../types'

// Mock getTodayString for stable test date
vi.mock('../lib/dateUtils', () => ({
  getTodayString: () => '2026-03-18',
  toDateStr: (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  },
}))

const makeEvent = (overrides: Partial<EventItem>): EventItem => ({
  id: 'e1',
  eventName: 'Test',
  facility: '有明ガーデン',
  category: 'music',
  startDate: '2026-03-18',
  endDate: '2026-03-18',
  sourceURL: 'https://example.com',
  lastUpdated: '2026-03-18',
  ...overrides,
})

describe('CalendarView', () => {
  it('renders the correct month heading', () => {
    render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    expect(screen.getByText('2026年3月')).toBeInTheDocument()
  })

  it('renders 7 weekday headers', () => {
    render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    const days = ['日', '月', '火', '水', '木', '金', '土']
    days.forEach(d => expect(screen.getByText(d)).toBeInTheDocument())
  })

  it('marks today cell with data-today attribute', () => {
    render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    const todayCell = document.querySelector('[data-today]')
    expect(todayCell).not.toBeNull()
  })

  it('navigates to previous month on prev button click', () => {
    render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('前月'))
    expect(screen.getByText('2026年2月')).toBeInTheDocument()
  })

  it('navigates to next month on next button click', () => {
    render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('翌月'))
    expect(screen.getByText('2026年4月')).toBeInTheDocument()
  })

  it('renders event category dots for events on a date', () => {
    const events = [
      makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', category: 'music' }),
    ]
    render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    // Music dot has title="music"
    const dot = document.querySelector('[title="music"]')
    expect(dot).not.toBeNull()
  })

  it('shows empty state and reset button when no events', () => {
    render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    expect(screen.getByText('条件に一致するイベントがありません')).toBeInTheDocument()
    expect(screen.getByText('フィルタをリセット')).toBeInTheDocument()
  })

  it('calls onResetFilters when reset button clicked', () => {
    const onResetFilters = vi.fn()
    render(<CalendarView events={[]} onResetFilters={onResetFilters} />)
    fireEvent.click(screen.getByText('フィルタをリセット'))
    expect(onResetFilters).toHaveBeenCalledTimes(1)
  })

  it('navigates across year boundary (Dec -> Jan)', () => {
    // Start at 2026-03, go back to Dec, then check year changes
    render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    // Go back 3 months to Dec 2025
    fireEvent.click(screen.getByLabelText('前月'))
    fireEvent.click(screen.getByLabelText('前月'))
    fireEvent.click(screen.getByLabelText('前月'))
    expect(screen.getByText('2025年12月')).toBeInTheDocument()
  })
})
