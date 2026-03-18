import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ShareButton from './ShareButton'

describe('ShareButton', () => {
  const props = {
    title: 'テストイベント',
    text: '有明アリーナ | 2026-03-20',
    url: 'https://kannohi1.github.io/ariake-events?event=test-1',
  }

  beforeEach(() => {
    // Reset navigator mocks
    Object.defineProperty(global.navigator, 'share', {
      writable: true,
      value: undefined,
    })
    Object.defineProperty(global.navigator, 'clipboard', {
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders シェア button', () => {
    render(<ShareButton {...props} />)
    expect(screen.getByText('シェア')).toBeInTheDocument()
  })

  it('copies URL to clipboard when share API is unavailable', async () => {
    render(<ShareButton {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'シェア' }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(props.url)
    })
  })

  it('shows "コピーしました" toast after copying', async () => {
    render(<ShareButton {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'シェア' }))
    await waitFor(() => {
      expect(screen.getByText('コピーしました ✓')).toBeInTheDocument()
    })
  })

  it('uses navigator.share when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(global.navigator, 'share', {
      writable: true,
      value: shareMock,
    })
    render(<ShareButton {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'シェア' }))
    await waitFor(() => {
      expect(shareMock).toHaveBeenCalledWith({
        title: props.title,
        text: props.text,
        url: props.url,
      })
    })
  })
})
