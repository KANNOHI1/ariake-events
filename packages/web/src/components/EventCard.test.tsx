import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EventCard from './EventCard'
import { CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'
import { buildSearchQuery, TICKET_PLATFORMS } from '../lib/ticketPlatforms'
import { FACILITIES, type EventItem } from '../types'

const musicEvent: EventItem = {
  id: 'test-001',
  eventName: 'テストコンサート',
  facility: FACILITIES[2],
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
    expect(screen.getByText(FACILITIES[2])).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.music)).toBeInTheDocument()
  })

  it('renders the congestion badge without a bottom progress bar when congestionRisk is positive', () => {
    const { container } = render(<EventCard event={{ ...musicEvent, congestionRisk: 0.7 }} />)
    const info = getCongestionInfo(0.7)

    expect(screen.getByText(info?.label ?? '')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="congestion-bar"]')).toBeNull()
  })

  it('uses a Pinterest-style rounded card shell (rounded-xl)', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const article = container.querySelector('article')
    expect(article?.className).toContain('rounded-xl')
  })

  it('uses a subtle shadow (shadow-sm) that lifts on hover', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const article = container.querySelector('article')
    expect(article?.className).toContain('shadow-sm')
    expect(article?.className).toContain('hover:shadow-md')
  })

  it('renders image with natural aspect ratio (no forced aspect-video / max-h)', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const img = container.querySelector('img')
    expect(img?.className).toContain('h-auto')
    expect(img?.className).toContain('w-full')
    expect(container.querySelector('.aspect-video')).toBeNull()
  })

  it('stacks image above text in flex-col regardless of viewMode', () => {
    const { container: listContainer } = render(<EventCard event={musicEvent} viewMode="list" />)
    const { container: gridContainer } = render(<EventCard event={musicEvent} viewMode="grid" />)
    expect(listContainer.querySelector('a.flex-col')).not.toBeNull()
    expect(gridContainer.querySelector('a.flex-col')).not.toBeNull()
  })

  it('always applies line-clamp-2 to the title (Pinterest-style)', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByRole('heading', { name: musicEvent.eventName }).className).toContain('line-clamp-2')
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
    expect(within(dialog).getAllByRole('link')).toHaveLength(3)
    for (const platform of TICKET_PLATFORMS) {
      expect(within(dialog).getByRole('link', { name: platform.name })).toBeInTheDocument()
    }
  })

  it('uses encoded search queries in each ticket platform href', () => {
    const eventName = 'DIR EN GREY DIR EN GREY MORTAL DOWNER'
    const event = { ...eventWithCategory('music'), eventName }
    const query = buildSearchQuery(eventName, event.facility)
    render(<EventCard event={event} />)

    fireEvent.click(screen.getByRole('button', { name: '🎫 チケットを探す' }))

    for (const platform of TICKET_PLATFORMS) {
      expect(screen.getByRole('link', { name: platform.name })).toHaveAttribute('href', platform.buildUrl(query))
    }
  })

  it('closes the modal when the backdrop is clicked', () => {
    render(<EventCard event={eventWithCategory('music')} />)

    fireEvent.click(screen.getByRole('button', { name: '🎫 チケットを探す' }))
    fireEvent.click(screen.getByTestId('ticket-modal-backdrop'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
