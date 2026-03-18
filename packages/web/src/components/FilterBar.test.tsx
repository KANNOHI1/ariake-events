import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'
import { getDefaultFilters } from '../lib/filter'
import { CATEGORY_LABELS } from '../lib/colorMap'

const defaultFilters = getDefaultFilters()

describe('FilterBar', () => {
  it('renders all 5 facility names', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    )
    expect(screen.getByText('有明ガーデン')).toBeInTheDocument()
    expect(screen.getByText('東京ガーデンシアター')).toBeInTheDocument()
    expect(screen.getByText('有明アリーナ')).toBeInTheDocument()
    expect(screen.getByText('TOYOTA ARENA TOKYO')).toBeInTheDocument()
    expect(screen.getByText('東京ビッグサイト')).toBeInTheDocument()
  })

  it('renders all 8 category labels', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    )
    expect(screen.getByText(CATEGORY_LABELS.music)).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.sports)).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.exhibition)).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.kids)).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.food)).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.fashion)).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.anime)).toBeInTheDocument()
    expect(screen.getByText(CATEGORY_LABELS.other)).toBeInTheDocument()
  })

  it('calls onToggleFacility when facility chip is clicked', () => {
    const onToggleFacility = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onToggleFacility={onToggleFacility}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('有明ガーデン'))
    expect(onToggleFacility).toHaveBeenCalledWith('有明ガーデン')
  })

  it('calls onToggleCategory when category chip is clicked', () => {
    const onToggleCategory = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onToggleFacility={vi.fn()}
        onToggleCategory={onToggleCategory}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText(CATEGORY_LABELS.music))
    expect(onToggleCategory).toHaveBeenCalledWith('music')
  })

  it('shows facility chip as active (aria-pressed=true) when selected', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    )
    const chip = screen.getByText('有明ガーデン').closest('button')
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows facility chip as inactive (aria-pressed=false) when deselected', () => {
    const filters = { ...defaultFilters, facilities: [] }
    render(
      <FilterBar
        filters={filters}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />
    )
    const chip = screen.getByText('有明ガーデン').closest('button')
    expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelectAll when "すべて選択" is clicked', () => {
    const onSelectAll = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={onSelectAll}
        onDeselectAll={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('すべて選択'))
    expect(onSelectAll).toHaveBeenCalledTimes(1)
  })

  it('calls onDeselectAll when "すべて解除" is clicked', () => {
    const onDeselectAll = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={onDeselectAll}
      />
    )
    fireEvent.click(screen.getByText('すべて解除'))
    expect(onDeselectAll).toHaveBeenCalledTimes(1)
  })
})
