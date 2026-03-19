import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'
import { CATEGORY_LABELS } from '../lib/colorMap'

const defaultFilters = { facility: null, category: null }

describe('FilterBar', () => {
  it('renders "すべての施設" chip', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'すべての施設' })).toBeInTheDocument()
  })

  it('renders "すべて" category chip', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'すべて' })).toBeInTheDocument()
  })

  it('renders all 5 facility chips', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: '有明ガーデン' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '東京ガーデンシアター' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '有明アリーナ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TOYOTA ARENA TOKYO' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '東京ビッグサイト' })).toBeInTheDocument()
  })

  it('renders all 8 category chips', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    Object.values(CATEGORY_LABELS).forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    })
  })

  it('calls onSetFacility with facility name when chip is clicked', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={onSetFacility}
        onSetCategory={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '有明ガーデン' }))
    expect(onSetFacility).toHaveBeenCalledWith('有明ガーデン')
  })

  it('calls onSetFacility with null when "すべての施設" chip is clicked', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterBar
        filters={{ facility: '有明ガーデン', category: null }}
        onSetFacility={onSetFacility}
        onSetCategory={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'すべての施設' }))
    expect(onSetFacility).toHaveBeenCalledWith(null)
  })

  it('calls onSetCategory with category key when chip is clicked', () => {
    const onSetCategory = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={onSetCategory}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'ミュージック' }))
    expect(onSetCategory).toHaveBeenCalledWith('music')
  })

  it('calls onSetCategory with null when "すべて" chip is clicked', () => {
    const onSetCategory = vi.fn()
    render(
      <FilterBar
        filters={{ facility: null, category: 'music' }}
        onSetFacility={vi.fn()}
        onSetCategory={onSetCategory}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'すべて' }))
    expect(onSetCategory).toHaveBeenCalledWith(null)
  })
})
