import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EventCard from './EventCard'
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

  it('renders a progress bar when congestionRisk is positive', () => {
    const { container } = render(<EventCard event={{ ...musicEvent, congestionRisk: 0.7 }} />)
    const bar = container.querySelector('[data-testid="congestion-bar"]')
    expect(bar).not.toBeNull()
  })

  it('does not render a progress bar when congestionRisk is zero', () => {
    const { container } = render(<EventCard event={{ ...musicEvent, congestionRisk: 0 }} />)
    const bar = container.querySelector('[data-testid="congestion-bar"]')
    expect(bar).toBeNull()
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
