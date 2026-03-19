import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from './page'
import type { EventItem } from '../types'
import { fetchEvents } from '../lib/events'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

// Mock events fetcher
vi.mock('../lib/events', () => ({
  fetchEvents: vi.fn(),
}))

// Mock TransportView to isolate routing logic
vi.mock('../components/TransportView', () => ({
  default: () => <div>りんかい線</div>,
}))

// Mock dateUtils to return stable dates
vi.mock('../lib/dateUtils', () => ({
  getTodayString: () => '2026-03-18',
  getWeekRange: () => ({ start: '2026-03-18', end: '2026-03-24' }),
  isInRange: (start: string, end: string, rStart: string, rEnd: string) =>
    start <= rEnd && end >= rStart,
}))

const mockFetchEvents = fetchEvents as ReturnType<typeof vi.fn>

const sampleEvents: EventItem[] = [
  {
    id: '1',
    eventName: '今日のコンサート',
    facility: '有明アリーナ',
    category: 'music',
    startDate: '2026-03-18',
    endDate: '2026-03-18',
    sourceURL: 'https://example.com/1',
    lastUpdated: '2026-03-18',
  },
  {
    id: '2',
    eventName: '今週の展示会',
    facility: '東京ビッグサイト',
    category: 'exhibition',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    sourceURL: 'https://example.com/2',
    lastUpdated: '2026-03-18',
  },
]

beforeEach(() => {
  mockFetchEvents.mockResolvedValue(sampleEvents)
  // Mock window.history.replaceState
  Object.defineProperty(window, 'history', {
    value: { replaceState: vi.fn() },
    writable: true,
  })
})

describe('Home page', () => {
  it('renders page header', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('有明イベント情報')).toBeInTheDocument()
    })
  })

  it('renders FilterBar', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('有明ガーデン')).toBeInTheDocument()
    })
  })

  it('renders ViewTabs', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('今日')).toBeInTheDocument()
      expect(screen.getByText('今週')).toBeInTheDocument()
      expect(screen.getByText('カレンダー')).toBeInTheDocument()
    })
  })

  it('shows today events by default', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText('今日のコンサート')).toBeInTheDocument()
    })
  })

  it('renders TransportView when transport tab is active', async () => {
    render(<Home />)
    await waitFor(() => expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument())
    fireEvent.click(screen.getByText('交通'))
    expect(screen.getByText('りんかい線')).toBeInTheDocument()
  })

  it('hides FilterBar when transport tab is active', async () => {
    render(<Home />)
    await waitFor(() => expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument())
    fireEvent.click(screen.getByText('交通'))
    expect(screen.queryByText('有明ガーデン')).not.toBeInTheDocument()
  })
})
