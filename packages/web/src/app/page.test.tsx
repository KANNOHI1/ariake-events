import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Home from './page'
import type { EventItem } from '../types'
import { FACILITIES } from '../types'
import { fetchEvents } from '../lib/events'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('../lib/events', () => ({
  fetchEvents: vi.fn(),
}))

vi.mock('../components/TransportView', () => ({
  default: () => <div>Transport View</div>,
}))

vi.mock('../lib/dateUtils', () => ({
  getTodayString: () => '2026-03-18',
  getWeekRange: () => ({ start: '2026-03-18', end: '2026-03-24' }),
  isInRange: (start: string, end: string, rangeStart: string, rangeEnd: string) =>
    start <= rangeEnd && end >= rangeStart,
}))

const mockFetchEvents = fetchEvents as ReturnType<typeof vi.fn>

const sampleEvents: EventItem[] = [
  {
    id: '1',
    eventName: 'Today Concert',
    facility: FACILITIES[2],
    category: 'music',
    startDate: '2026-03-18',
    endDate: '2026-03-18',
    sourceURL: 'https://example.com/1',
    lastUpdated: '2026-03-18',
  },
  {
    id: '2',
    eventName: 'Weekend Exhibition',
    facility: FACILITIES[4],
    category: 'exhibition',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    sourceURL: 'https://example.com/2',
    lastUpdated: '2026-03-18',
  },
]

beforeEach(() => {
  mockFetchEvents.mockResolvedValue(sampleEvents)
  Object.defineProperty(window, 'history', {
    value: { replaceState: vi.fn() },
    writable: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Home page', () => {
  it('renders split title, date pill, and constrained header, filter bar, and main wrappers', async () => {
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation((_locale, options) => {
      const format = options as Intl.DateTimeFormatOptions | undefined
      return format?.year ? '2026年3月18日(水)' : '3月18日(水)'
    })

    const { container } = render(<Home />)

    const heading = await screen.findByRole('heading', { level: 1, name: /有明.*イベント/ })
    expect(within(heading).getByText('有明')).toHaveClass('text-primary-500')
    expect(within(heading).getByText('イベント')).toHaveClass('text-slate-900')

    const header = container.querySelector('header')!
    const datePill = within(header).getByText('3月18日(水)')
    expect(datePill.tagName).toBe('SPAN')
    expect(datePill).toHaveClass('font-semibold', 'bg-[#fff3ed]', 'rounded-full')

    const headerContent = container.querySelector('header > div')
    expect(headerContent).not.toBeNull()
    expect(headerContent).toHaveClass('max-w-5xl', 'mx-auto', 'w-full')

    const filterBarWrapper = container.querySelector('header + div')
    expect(filterBarWrapper).not.toBeNull()
    expect(filterBarWrapper).toHaveClass('max-w-5xl', 'mx-auto', 'w-full')

    const main = container.querySelector('main')
    expect(main).not.toBeNull()
    expect(main).toHaveClass('max-w-5xl', 'mx-auto')
  })

  it('renders navigation tabs', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(4)
    })
  })

  it('shows only today events by default', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Today Concert')).toBeInTheDocument()
    })

    expect(screen.queryByText('Weekend Exhibition')).not.toBeInTheDocument()
  })

  it('renders TransportView when the transport tab is active', async () => {
    render(<Home />)

    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(4)
    })

    fireEvent.click(screen.getAllByRole('tab')[3])

    await waitFor(() => {
      expect(screen.getByText('Transport View')).toBeInTheDocument()
    })
  })
})
