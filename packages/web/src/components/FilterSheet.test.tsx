import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterSheet from './FilterSheet'

const defaultProps = {
  isOpen: false,
  onClose: vi.fn(),
  filters: { facility: null, category: null },
  onSetFacility: vi.fn(),
  onSetCategory: vi.fn(),
}

describe('FilterSheet', () => {
  it('シートが閉じているとき施設チップが表示されない', () => {
    render(<FilterSheet {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('有明ガーデン')).not.toBeInTheDocument()
  })

  it('シートが開いているとき「施設」セクションが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByText('施設')).toBeInTheDocument()
  })

  it('シートが開いているとき「すべての施設」チップが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByRole('button', { name: 'すべての施設' })).toBeInTheDocument()
  })

  it('シートが開いているとき5施設チップが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByRole('button', { name: '有明ガーデン' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '東京ガーデンシアター' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '有明アリーナ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TOYOTA ARENA TOKYO' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '東京ビッグサイト' })).toBeInTheDocument()
  })

  it('シートが開いているとき「カテゴリ」セクションが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
  })

  it('シートが開いているとき8カテゴリチップが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByRole('button', { name: 'ミュージック' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'スポーツ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展示・展覧' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キッズ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'フード' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ファッション' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アニメ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'その他' })).toBeInTheDocument()
  })

  it('施設チップクリック → onSetFacility が呼ばれる', () => {
    const onSetFacility = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onSetFacility={onSetFacility} />)
    fireEvent.click(screen.getByRole('button', { name: '有明ガーデン' }))
    expect(onSetFacility).toHaveBeenCalledWith('有明ガーデン')
  })

  it('「すべての施設」クリック → onSetFacility(null) が呼ばれる', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterSheet
        {...defaultProps}
        isOpen={true}
        onSetFacility={onSetFacility}
        filters={{ facility: '有明ガーデン', category: null }}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'すべての施設' }))
    expect(onSetFacility).toHaveBeenCalledWith(null)
  })

  it('カテゴリチップクリック → onSetCategory が呼ばれる', () => {
    const onSetCategory = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onSetCategory={onSetCategory} />)
    fireEvent.click(screen.getByRole('button', { name: 'ミュージック' }))
    expect(onSetCategory).toHaveBeenCalledWith('music')
  })

  it('✕ ボタンクリック → onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'シートを閉じる' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Backdrop クリック → onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('filter-sheet-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('アクティブ施設チップに bg-primary-500 クラスが付く', () => {
    render(
      <FilterSheet
        {...defaultProps}
        isOpen={true}
        filters={{ facility: '有明ガーデン', category: null }}
      />
    )
    const chip = screen.getByRole('button', { name: '有明ガーデン' })
    expect(chip.className).toContain('bg-primary-500')
  })
})
