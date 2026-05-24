import { render, screen } from '@testing-library/react'
import { fireEvent, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EventCard from './EventCard'
import { getCongestionInfo } from '../lib/colorMap'
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
  it('links to the source URL in a new tab', () => {
    render(<EventCard event={musicEvent} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/event')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders facility and category badges', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByText('有明アリーナ')).toBeInTheDocument()
    expect(screen.getByText('ミュージック')).toBeInTheDocument()
  })

  it('renders the congestion badge without a bottom progress bar when congestionRisk is positive', () => {
    const { container } = render(<EventCard event={{ ...musicEvent, congestionRisk: 0.7 }} />)
    const info = getCongestionInfo(0.7)

    expect(screen.getByText(info?.label ?? '')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="congestion-bar"]')).toBeNull()
  })

  it('uses a rounded-2xl card shell', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const article = container.querySelector('article')
    expect(article?.className).toContain('rounded-2xl')
  })

  it('uses Airbnb card shadows', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const article = container.querySelector('article')
    expect(article?.className).toContain('shadow-airbnb-card')
    expect(article?.className).toContain('hover:shadow-airbnb-card-hover')
  })

  it('uses a video aspect ratio image area in grid mode', () => {
    const { container } = render(<EventCard event={musicEvent} viewMode="grid" />)
    const imageArea = container.querySelector('.aspect-video')
    expect(imageArea).not.toBeNull()
  })

  it('applies line clamp only in list mode', () => {
    const listView = render(<EventCard event={musicEvent} viewMode="list" />)
    expect(screen.getByRole('heading', { name: musicEvent.eventName }).className).toContain('line-clamp-2')
    listView.unmount()

    render(<EventCard event={musicEvent} viewMode="grid" />)
    expect(screen.getByRole('heading', { name: musicEvent.eventName }).className).not.toContain('line-clamp-2')
  })
})

describe('EventCard ticket links', () => {
  const eventWithCategory = (category: EventItem['category']): EventItem => ({
    ...musicEvent,
    id: `test-${category}`,
    category,
    eventName: 'Ariake Live 2026',
  })

  it.each(['music', 'sports', 'anime'] as const)(
    'renders the ticket search button for %s events',
    (category) => {
      render(<EventCard event={eventWithCategory(category)} />)
      expect(screen.getByRole('button', { name: '🎫 チケットを探す' })).toBeInTheDocument()
    },
  )

  it.each(['food', 'exhibition', 'other'] as const)(
    'does not render the ticket search button for %s events',
    (category) => {
      render(<EventCard event={eventWithCategory(category)} />)
      expect(screen.queryByRole('button', { name: '🎫 チケットを探す' })).not.toBeInTheDocument()
    },
  )

  it('opens a modal with all ticket platform links when the ticket button is clicked', () => {
    render(<EventCard event={eventWithCategory('music')} />)

    fireEvent.click(screen.getByRole('button', { name: '🎫 チケットを探す' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('link', { name: 'チケットぴあ' })).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'ローチケ' })).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'イープラス' })).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: '楽天チケット' })).toBeInTheDocument()
  })

  it('uses encoded event names in each ticket platform href', () => {
    const eventName = '有明 ライブ 2026'
    render(<EventCard event={{ ...eventWithCategory('music'), eventName }} />)

    fireEvent.click(screen.getByRole('button', { name: '🎫 チケットを探す' }))

    expect(screen.getByRole('link', { name: 'チケットぴあ' })).toHaveAttribute(
      'href',
      `https://t.pia.jp/pia/search_all.do?kw=${encodeURIComponent(eventName)}`,
    )
    expect(screen.getByRole('link', { name: 'ローチケ' })).toHaveAttribute(
      'href',
      `https://l-tike.com/search/?keyword=${encodeURIComponent(eventName)}`,
    )
    expect(screen.getByRole('link', { name: 'イープラス' })).toHaveAttribute(
      'href',
      `https://eplus.jp/sf/search?keyword=${encodeURIComponent(eventName)}`,
    )
    expect(screen.getByRole('link', { name: '楽天チケット' })).toHaveAttribute(
      'href',
      `https://ticket.rakuten.co.jp/?q=${encodeURIComponent(eventName)}`,
    )
  })

  it('closes the modal when the backdrop is clicked', () => {
    render(<EventCard event={eventWithCategory('music')} />)

    fireEvent.click(screen.getByRole('button', { name: '🎫 チケットを探す' }))
    fireEvent.click(screen.getByTestId('ticket-modal-backdrop'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
