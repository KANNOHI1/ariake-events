import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ViewTabs from './ViewTabs'

describe('ViewTabs', () => {
  it('renders 4 tabs', () => {
    render(<ViewTabs activeView="today" onChangeView={vi.fn()} />)
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('カレンダー')).toBeInTheDocument()
    expect(screen.getByText('交通')).toBeInTheDocument()
  })

  it('marks active tab with aria-selected=true', () => {
    render(<ViewTabs activeView="month" onChangeView={vi.fn()} />)
    const weekTab = screen.getByText('月').closest('button')
    expect(weekTab).toHaveAttribute('aria-selected', 'true')
    const todayTab = screen.getByText('日').closest('button')
    expect(todayTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChangeView with correct view id', () => {
    const onChange = vi.fn()
    render(<ViewTabs activeView="today" onChangeView={onChange} />)
    fireEvent.click(screen.getByText('カレンダー'))
    expect(onChange).toHaveBeenCalledWith('calendar')
  })

  it('calls onChangeView with transport view id', () => {
    const onChange = vi.fn()
    render(<ViewTabs activeView="today" onChangeView={onChange} />)
    fireEvent.click(screen.getByText('交通'))
    expect(onChange).toHaveBeenCalledWith('transport')
  })
})
