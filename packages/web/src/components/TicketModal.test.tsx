import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TicketModal from './TicketModal'
import { buildSearchQuery, TICKET_PLATFORMS } from '../lib/ticketPlatforms'

describe('TicketModal', () => {
  it('renders all ticket platform names when open', () => {
    render(<TicketModal open={true} onClose={() => {}} eventName="Ariake Live 2026" facility="有明アリーナ" />)

    for (const platform of TICKET_PLATFORMS) {
      expect(screen.getByRole('link', { name: platform.name })).toBeInTheDocument()
    }
  })

  it('uses TICKET_PLATFORMS buildUrl results for each link href', () => {
    const eventName = 'DIR EN GREY DIR EN GREY MORTAL DOWNER'
    const facility = '有明アリーナ'
    const query = buildSearchQuery(eventName, facility)
    render(<TicketModal open={true} onClose={() => {}} eventName={eventName} facility={facility} />)

    for (const platform of TICKET_PLATFORMS) {
      expect(screen.getByRole('link', { name: platform.name })).toHaveAttribute('href', platform.buildUrl(query))
    }
  })

  it('renders the event name', () => {
    render(<TicketModal open={true} onClose={() => {}} eventName="Ariake Live 2026" facility="有明アリーナ" />)

    expect(screen.getByText(/Ariake Live 2026/)).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<TicketModal open={true} onClose={onClose} eventName="Ariake Live 2026" facility="有明アリーナ" />)

    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<TicketModal open={true} onClose={onClose} eventName="Ariake Live 2026" facility="有明アリーナ" />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <TicketModal open={false} onClose={() => {}} eventName="Ariake Live 2026" facility="有明アリーナ" />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
