import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'
import { CATEGORY_LABELS } from '../lib/colorMap'

const defaultFilters = { facility: null, category: null }

describe('FilterBar', () => {
  it('renders facility dropdown with "すべての施設" default', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    expect(screen.getByText('すべての施設')).toBeInTheDocument()
  })

  it('renders category dropdown with "すべてのカテゴリ" default', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    expect(screen.getByText('すべてのカテゴリ')).toBeInTheDocument()
  })

  it('renders all 5 facilities as options', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    expect(screen.getByRole('option', { name: '有明ガーデン' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '東京ガーデンシアター' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '有明アリーナ' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'TOYOTA ARENA TOKYO' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '東京ビッグサイト' })).toBeInTheDocument()
  })

  it('renders all 8 categories as options', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
      />
    )
    Object.values(CATEGORY_LABELS).forEach((label) => {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    })
  })

  it('calls onSetFacility with facility name when selected', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={onSetFacility}
        onSetCategory={vi.fn()}
      />
    )
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: '有明ガーデン' } })
    expect(onSetFacility).toHaveBeenCalledWith('有明ガーデン')
  })

  it('calls onSetFacility with null when "すべての施設" is selected', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterBar
        filters={{ facility: '有明ガーデン', category: null }}
        onSetFacility={onSetFacility}
        onSetCategory={vi.fn()}
      />
    )
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: '' } })
    expect(onSetFacility).toHaveBeenCalledWith(null)
  })

  it('calls onSetCategory with category key when selected', () => {
    const onSetCategory = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={onSetCategory}
      />
    )
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: 'music' } })
    expect(onSetCategory).toHaveBeenCalledWith('music')
  })

  it('calls onSetCategory with null when "すべてのカテゴリ" is selected', () => {
    const onSetCategory = vi.fn()
    render(
      <FilterBar
        filters={{ facility: null, category: 'music' }}
        onSetFacility={vi.fn()}
        onSetCategory={onSetCategory}
      />
    )
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: '' } })
    expect(onSetCategory).toHaveBeenCalledWith(null)
  })
})
