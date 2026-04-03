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
  it('uses full-width outer padding wrapper without max width centering', () => {
    const { container } = render(<CalendarView events={[]} onResetFilters={vi.fn()} />)
    const wrapper = container.firstChild

    expect(wrapper).toHaveClass('p-4')
    expect(wrapper).not.toHaveClass('max-w-2xl')
    expect(wrapper).not.toHaveClass('mx-auto')
  })

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

  it('congestionRisk が 0.5 のイベントがある日にカラーバーが表示される', () => {
    const events = [makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: 0.5 })]
    const { container } = render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    // bg-amber-400 クラスを持つ要素が存在する（やや混雑）
    const bar = container.querySelector('.bg-amber-400')
    expect(bar).not.toBeNull()
  })

  it('congestionRisk が null のイベントのみの日はカラーバーが表示されない', () => {
    const events = [makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: null })]
    const { container } = render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    expect(container.querySelector('.bg-amber-400')).toBeNull()
    expect(container.querySelector('.bg-emerald-400')).toBeNull()
    expect(container.querySelector('.bg-orange-400')).toBeNull()
    expect(container.querySelector('.bg-rose-500')).toBeNull()
  })

  it('congestionRisk が 0.85 のイベントがある日に rose バーが表示される', () => {
    const events = [makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: 0.85 })]
    const { container } = render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    const bar = container.querySelector('.bg-rose-500')
    expect(bar).not.toBeNull()
  })

  it('モーダル内のイベントに混雑度バッジが表示される', () => {
    const events = [
      makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: 0.5 }),
    ]
    render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    const cell = document.querySelector('[data-date="2026-03-18"]')
    expect(cell).not.toBeNull()
    fireEvent.click(cell!)
    expect(screen.getByText('やや混雑')).toBeInTheDocument()
  })

  it('congestionRisk が null のイベントはモーダル内にバッジが表示されない', () => {
    const events = [
      makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: null }),
    ]
    render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    const cell = document.querySelector('[data-date="2026-03-18"]')
    fireEvent.click(cell!)
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
  })

  it('uses the taller modal max height so the bottom remains visible', () => {
    const events = [makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18' })]
    const { container } = render(<CalendarView events={events} onResetFilters={vi.fn()} />)

    const cell = document.querySelector('[data-date="2026-03-18"]')
    fireEvent.click(cell!)

    const panel = container.querySelector('.max-h-\\[85dvh\\]')
    expect(panel).not.toBeNull()
    expect(panel?.className).not.toContain('max-h-[70vh]')
  })
})
