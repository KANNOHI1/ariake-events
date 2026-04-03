import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventCard from './EventCard'
import type { EventItem } from '../types'

const musicEvent: EventItem = {
  id: 'test-001',
  eventName: 'テストコンサート',
  facility: '有明アリーナ',
  category: 'music',
  startDate: '2026-03-20',
  endDate: '2026-03-21',
  sourceURL: 'https://example.com/event',
  lastUpdated: '2026-03-18',
}

describe('EventCard', () => {
  it('カード全体が sourceURL へのリンクになっている', () => {
    render(<EventCard event={musicEvent} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/event')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('施設バッジが表示される', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByText('有明アリーナ')).toBeInTheDocument()
  })

  it('カテゴリバッジが日本語ラベルで表示される', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByText('ミュージック')).toBeInTheDocument()
  })

  it('congestionRisk=0 のとき混雑バッジが表示されない', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: 0 }} />)
    expect(screen.queryByText('空いている')).toBeNull()
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
    expect(screen.queryByText('非常に混雑')).toBeNull()
  })

  it('congestionRisk=0.5 のとき「やや混雑」バッジが表示される', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: 0.5 }} />)
    expect(screen.getByText('やや混雑')).toBeInTheDocument()
  })

  it('imageUrl がないとき施設写真を表示する', () => {
    render(<EventCard event={musicEvent} />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('/facilities/ariake-arena.jpg')
  })

  it('imageUrl があるとき実画像を表示する', () => {
    const event = { ...musicEvent, imageUrl: 'https://example.com/photo.jpg' }
    render(<EventCard event={event} />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toBe('https://example.com/photo.jpg')
  })

  it('congestionRisk が null のとき混雑バッジが表示されない', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: null }} />)
    expect(screen.queryByText('空いている')).toBeNull()
    expect(screen.queryByText('やや混雑')).toBeNull()
  })
  it('grid mode keeps the outer link as a plain block', () => {
    render(<EventCard event={musicEvent} viewMode="grid" />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('block')
    expect(link.className).not.toContain('break-inside-avoid')
    expect(link.className).not.toContain('mb-3')
  })

  it('grid mode uses a video aspect ratio for the image area', () => {
    const { container } = render(<EventCard event={musicEvent} viewMode="grid" />)
    const imageArea = container.querySelector('.aspect-video')
    expect(imageArea).not.toBeNull()
    expect(imageArea?.className).not.toContain('aspect-square')
  })

  it('grid mode does not apply line-clamp-2 to title', () => {
    render(<EventCard event={musicEvent} viewMode="grid" />)
    const title = screen.getByRole('heading', { name: musicEvent.eventName })
    expect(title.className).not.toContain('line-clamp-2')
  })

  it('list mode applies line-clamp-2 to title', () => {
    render(<EventCard event={musicEvent} viewMode="list" />)
    const title = screen.getByRole('heading', { name: musicEvent.eventName })
    expect(title.className).toContain('line-clamp-2')
  })

  it('施設フォールバック写真は object-cover でビッタビタ表示', () => {
    render(<EventCard event={musicEvent} />)  // imageUrl なし → 施設写真
    const img = screen.getByRole('img', { name: musicEvent.eventName })
    expect(img).toHaveClass('object-cover')
    expect(img.className).not.toContain('object-contain')
  })

  it('イベント固有画像は object-contain で全体表示', () => {
    const eventWithImage = { ...musicEvent, imageUrl: 'https://example.com/banner.jpg' }
    render(<EventCard event={eventWithImage} />)
    const img = screen.getByRole('img', { name: musicEvent.eventName })
    expect(img).toHaveClass('object-contain')
    expect(img.className).not.toContain('object-cover')
  })

  it('image container uses bg-black for blurred backdrop', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const imageArea = container.querySelector('.bg-black')
    expect(imageArea).not.toBeNull()
    expect(container.querySelector('.bg-slate-100')).toBeNull()
  })

  it('backdrop image includes blur-sm opacity-70 and aria-hidden', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const imgs = container.querySelectorAll('img')
    const backdropImg = imgs[0]

    expect(backdropImg).toHaveAttribute('aria-hidden', 'true')
    expect(backdropImg).toHaveClass('blur-sm')
    expect(backdropImg).toHaveClass('opacity-70')
    expect(backdropImg).toHaveClass('object-cover')
  })

  it('backdrop and foreground images use the same src before imgError', () => {
    const { container } = render(<EventCard event={musicEvent} />)
    const imgs = container.querySelectorAll('img')

    expect((imgs[0] as HTMLImageElement).src).toBe((imgs[1] as HTMLImageElement).src)
  })
})
