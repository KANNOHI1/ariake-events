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
  it('renders all 4 route names', () => {
    render(<TransportView />)

    for (const route of timetable) {
      expect(screen.getByText(route.name)).toBeInTheDocument()
    }
  })

  it('renders direction labels', () => {
    render(<TransportView />)

    expect(screen.getByText(timetable[0].directions[0].label)).toBeInTheDocument()
    expect(screen.getByText(timetable[0].directions[1].label)).toBeInTheDocument()
    expect(screen.getAllByText(timetable[1].directions[0].label).length).toBeGreaterThan(0)
    expect(screen.getByText(timetable[1].directions[1].label)).toBeInTheDocument()
    expect(screen.getByText(timetable[3].directions[1].label)).toBeInTheDocument()
    expect(screen.getByText(timetable[2].directions[0].label)).toBeInTheDocument()
  })

  it('renders station name and walk time', () => {
    render(<TransportView />)

    expect(screen.getByText(timetable[0].station)).toBeInTheDocument()
    expect(
      screen.getByText(`\u5f92\u6b69${timetable[0].walkMinutes}\u5206`)
    ).toBeInTheDocument()
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

  it('renders logo images for all 4 routes', () => {
    render(<TransportView />)

    for (const route of timetable) {
      expect(screen.getByRole('img', { name: route.name })).toBeInTheDocument()
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

    expect(routeHeaders.length).toBe(4)
  })

  it('table has w-full class', () => {
    const { container } = render(<TransportView />)
    const table = container.querySelector('table')

    expect(table).toHaveClass('w-full')
  })

  it('keeps direction headers sticky below the app header', () => {
    const { container } = render(<TransportView />)
    const directionHeaders = Array.from(container.querySelectorAll('thead tr:nth-child(4) th'))

    expect(directionHeaders.length).toBeGreaterThan(0)
    for (const header of directionHeaders) {
      expect(header).toHaveClass('sticky', 'top-[112px]', 'z-10')
    }
  })
})
