import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TicketModal from './TicketModal'
import { TICKET_PLATFORMS } from '../lib/ticketPlatforms'

describe('TicketModal', () => {
  it('renders all ticket platform names when open', () => {
    render(<TicketModal open={true} onClose={() => {}} eventName="Ariake Live 2026" />)

    expect(screen.getByRole('link', { name: 'チケットぴあ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ローチケ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'イープラス' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '楽天チケット' })).toBeInTheDocument()
  })

  it('uses TICKET_PLATFORMS buildUrl results for each link href', () => {
    const eventName = '有明 ライブ 2026'
    render(<TicketModal open={true} onClose={() => {}} eventName={eventName} />)

    for (const platform of TICKET_PLATFORMS) {
      expect(screen.getByRole('link', { name: platform.name })).toHaveAttribute(
        'href',
        platform.buildUrl(eventName),
      )
    }
  })

  it('renders the event name', () => {
    render(<TicketModal open={true} onClose={() => {}} eventName="Ariake Live 2026" />)

    expect(screen.getByText('🎫 「Ariake Live 2026」のチケットを探す')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<TicketModal open={true} onClose={onClose} eventName="Ariake Live 2026" />)

    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<TicketModal open={true} onClose={onClose} eventName="Ariake Live 2026" />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when closed', () => {
    const { container } = render(<TicketModal open={false} onClose={() => {}} eventName="Ariake Live 2026" />)

    expect(container).toBeEmptyDOMElement()
  })
})
