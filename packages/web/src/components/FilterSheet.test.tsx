import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterSheet from './FilterSheet'
import { CATEGORY_LABELS } from '../lib/colorMap'
import { FACILITIES } from '../types'

const defaultProps = {
  isOpen: false,
  onClose: vi.fn(),
  filters: { facility: null, category: null },
  onSetFacility: vi.fn(),
  onSetCategory: vi.fn(),
}

describe('FilterSheet', () => {
  it('does not render when closed', () => {
    render(<FilterSheet {...defaultProps} isOpen={false} />)
    expect(screen.queryByText(FACILITIES[0])).not.toBeInTheDocument()
  })

  it('renders the sheet title when open', () => {
    render(<FilterSheet {...defaultProps} isOpen />)
    expect(screen.getByText('\u7d5e\u308a\u8fbc\u307f')).toBeInTheDocument()
  })

  it('renders the all facilities button when open', () => {
    render(<FilterSheet {...defaultProps} isOpen />)
    expect(screen.getByRole('button', { name: '\u3059\u3079\u3066\u306e\u65bd\u8a2d' })).toBeInTheDocument()
  })

  it('renders facility filter chips', () => {
    render(<FilterSheet {...defaultProps} isOpen />)
    for (const facility of FACILITIES) {
      expect(screen.getByRole('button', { name: facility })).toBeInTheDocument()
    }
  })

  it('renders the category section when open', () => {
    render(<FilterSheet {...defaultProps} isOpen />)
    expect(screen.getByText('\u30ab\u30c6\u30b4\u30ea')).toBeInTheDocument()
  })

  it('renders category filter chips using current labels', () => {
    render(<FilterSheet {...defaultProps} isOpen />)
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.music })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.sports })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.exhibition })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.kids })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.food })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.fashion })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.anime })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CATEGORY_LABELS.other })).toBeInTheDocument()
  })

  it('calls onSetFacility when a facility chip is clicked', () => {
    const onSetFacility = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen onSetFacility={onSetFacility} />)
    fireEvent.click(screen.getByRole('button', { name: FACILITIES[0] }))
    expect(onSetFacility).toHaveBeenCalledWith(FACILITIES[0])
  })

  it('calls onSetFacility(null) when all facilities is clicked', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterSheet
        {...defaultProps}
        isOpen
        onSetFacility={onSetFacility}
        filters={{ facility: FACILITIES[0], category: null }}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '\u3059\u3079\u3066\u306e\u65bd\u8a2d' }))
    expect(onSetFacility).toHaveBeenCalledWith(null)
  })

  it('calls onSetCategory when a category chip is clicked', () => {
    const onSetCategory = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen onSetCategory={onSetCategory} />)
    fireEvent.click(screen.getByRole('button', { name: CATEGORY_LABELS.music }))
    expect(onSetCategory).toHaveBeenCalledWith('music')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '\u30b7\u30fc\u30c8\u3092\u9589\u3058\u308b' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen onClose={onClose} />)
    fireEvent.click(screen.getByTestId('filter-sheet-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('applies active chip styles to the selected facility', () => {
    render(
      <FilterSheet
        {...defaultProps}
        isOpen
        filters={{ facility: FACILITIES[0], category: null }}
      />
    )
    const chip = screen.getByRole('button', { name: FACILITIES[0] })
    expect(chip.className).toContain('bg-primary-500')
  })
})
