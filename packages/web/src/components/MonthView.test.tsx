import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MonthView from './MonthView'
import type { EventItem } from '../types'
import { FACILITIES } from '../types'

vi.mock('../lib/dateUtils', () => ({
  getTodayString: () => '2026-03-18',
}))

const makeEvent = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: 'month-1',
  eventName: 'Month Event',
  facility: FACILITIES[0],
  category: 'music',
  startDate: '2026-03-18',
  endDate: '2026-03-18',
  sourceURL: 'https://example.com/month',
  lastUpdated: '2026-03-18',
  ...overrides,
})

describe('MonthView', () => {
  it('grid mode uses the responsive CSS grid layout', () => {
    const { container } = render(
      <MonthView events={[makeEvent()]} onResetFilters={vi.fn()} viewMode="grid" />
    )

    const grid = container.querySelector('.grid.grid-cols-2')
    expect(grid).not.toBeNull()
    expect(grid).toHaveClass('lg:grid-cols-3', 'xl:grid-cols-4', 'gap-3', 'p-4')
  })

  it('month navigation stays in normal flow without sticky positioning', () => {
    const { container } = render(
      <MonthView events={[makeEvent()]} onResetFilters={vi.fn()} viewMode="list" />
    )

    const nav = container.querySelector('div.flex.items-center.justify-between')
    expect(nav).toHaveClass('bg-[#f8f6f6]')
    expect(nav?.className).not.toContain('sticky')
    expect(nav?.className).not.toContain('top-[')
    expect(nav?.className).not.toContain('z-10')
    expect(nav?.className).not.toContain('backdrop-blur-sm')
  })
})
