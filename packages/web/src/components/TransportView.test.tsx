import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { timetable } from '../data/timetable'
import TransportView from './TransportView'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-23T14:30:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TransportView', () => {
  it('renders each route name the expected number of times', () => {
    render(<TransportView />)

    const routeNameCounts = timetable.reduce<Record<string, number>>((counts, route) => {
      counts[route.name] = (counts[route.name] ?? 0) + 1
      return counts
    }, {})

    for (const [routeName, count] of Object.entries(routeNameCounts)) {
      expect(screen.getAllByText(routeName)).toHaveLength(count)
    }
  })

  it('renders each direction label the expected number of times', () => {
    render(<TransportView />)

    const labelCounts = timetable
      .flatMap((route) => route.directions.map((direction) => direction.label))
      .reduce<Record<string, number>>((counts, label) => {
        counts[label] = (counts[label] ?? 0) + 1
        return counts
      }, {})

    for (const [label, count] of Object.entries(labelCounts)) {
      expect(screen.getAllByText(label)).toHaveLength(count)
    }
  })

  it('renders station name and walk time', () => {
    render(<TransportView />)

    expect(screen.getByText(timetable[0].station)).toBeInTheDocument()
    expect(
      screen.getAllByText(`\u5f92\u6b69${timetable[0].walkMinutes}\u5206`).length
    ).toBeGreaterThan(0)
  })

  it('shows only departures at or after current time', () => {
    render(<TransportView />)

    expect(screen.queryAllByText('06:17').length).toBe(0)
    expect(screen.getAllByText('14:34').length).toBeGreaterThan(0)
  })

  it('shows weekday schedule on weekday', () => {
    render(<TransportView />)

    expect(screen.getAllByText('14:34').length).toBeGreaterThan(0)
  })

  it('renders logo images for all routes', () => {
    render(<TransportView />)

    const routeNameCounts = timetable.reduce<Record<string, number>>((counts, route) => {
      counts[route.name] = (counts[route.name] ?? 0) + 1
      return counts
    }, {})

    for (const [routeName, count] of Object.entries(routeNameCounts)) {
      expect(screen.getAllByRole('img', { name: routeName })).toHaveLength(count)
    }
  })

  it('logo for first route has correct src', () => {
    render(<TransportView />)

    const img = screen.getByRole('img', { name: timetable[0].name })
    expect(img).toHaveAttribute('src', '/transport/rinkai.svg')
  })

  it('prefixes logo src with NEXT_PUBLIC_BASE_PATH when configured', async () => {
    const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH
    process.env.NEXT_PUBLIC_BASE_PATH = '/ariake-events'
    vi.resetModules()

    try {
      const { default: TransportViewWithBasePath } = await import('./TransportView')

      render(<TransportViewWithBasePath />)

      const img = screen.getByRole('img', { name: timetable[0].name })
      expect(img).toHaveAttribute('src', '/ariake-events/transport/rinkai.svg')
    } finally {
      if (originalBasePath === undefined) {
        delete process.env.NEXT_PUBLIC_BASE_PATH
      } else {
        process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath
      }
      vi.resetModules()
    }
  })

  it('renders header cells with light gray background class', () => {
    const { container } = render(<TransportView />)
    const headerCells = container.querySelectorAll('th')
    const routeHeaders = Array.from(headerCells).filter((th) =>
      th.classList.contains('bg-slate-50')
    )

    expect(routeHeaders.length).toBe(timetable.length)
  })

  it('table has w-full class', () => {
    const { container } = render(<TransportView />)
    const table = container.querySelector('table')

    expect(table).toHaveClass('w-full')
  })

  it('direction headers use slate-200 background', () => {
    const { container } = render(<TransportView />)
    const directionHeaders = Array.from(container.querySelectorAll('thead tr:nth-child(4) th'))

    expect(directionHeaders.length).toBeGreaterThan(0)
    for (const header of directionHeaders) {
      expect(header).toHaveClass('bg-slate-200')
    }
  })

  it('thead is sticky within the scroll container', () => {
    const { container } = render(<TransportView />)
    const thead = container.querySelector('thead')

    expect(thead).toHaveClass('sticky', 'top-0', 'z-10')
  })
})
