import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'

const defaultFilters = { facility: null, category: null }
const defaultViewProps = { viewMode: 'list' as const, onToggleViewMode: vi.fn() }

describe('FilterBar', () => {
  it('「絞り込み」ボタンが表示される', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByRole('button', { name: /絞り込み/ })).toBeInTheDocument()
  })

  it('フィルター未選択時はバッジが表示されない', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.queryByTestId('filter-badge')).not.toBeInTheDocument()
  })

  it('施設のみ選択時にバッジ「1」が表示される', () => {
    render(
      <FilterBar
        filters={{ facility: '有明ガーデン', category: null }}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByTestId('filter-badge')).toHaveTextContent('1')
  })

  it('施設+カテゴリ選択時にバッジ「2」が表示される', () => {
    render(
      <FilterBar
        filters={{ facility: '有明ガーデン', category: 'music' }}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByTestId('filter-badge')).toHaveTextContent('2')
  })

  it('「絞り込み」ボタンクリックでシートが開く', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /絞り込み/ }))
    expect(screen.getByText('施設')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
  })

  it('グリッドトグルボタンが表示される', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByRole('button', { name: 'グリッド表示に切り替え' })).toBeInTheDocument()
  })

  it('グリッドトグルクリック → onToggleViewMode が呼ばれる', () => {
    const onToggleViewMode = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        viewMode='list'
        onToggleViewMode={onToggleViewMode}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'グリッド表示に切り替え' }))
    expect(onToggleViewMode).toHaveBeenCalledOnce()
  })

  it('シート内で施設チップクリック → onSetFacility が呼ばれる', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={onSetFacility}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /絞り込み/ }))
    fireEvent.click(screen.getByRole('button', { name: '有明ガーデン' }))
    expect(onSetFacility).toHaveBeenCalledWith('有明ガーデン')
  })

  it('シート内でカテゴリチップクリック → onSetCategory が呼ばれる', () => {
    const onSetCategory = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={onSetCategory}
        {...defaultViewProps}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /絞り込み/ }))
    fireEvent.click(screen.getByRole('button', { name: 'ミュージック' }))
    expect(onSetCategory).toHaveBeenCalledWith('music')
  })
})
