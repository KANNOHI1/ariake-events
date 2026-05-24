import type { EventCategory } from '../types'

export const TICKET_PLATFORMS = [
  {
    id: 'pia',
    name: 'チケットぴあ',
    color: 'bg-red-600',
    buildUrl: (q: string) => `https://t.pia.jp/pia/search_all.do?kw=${encodeURIComponent(q)}`,
  },
  {
    id: 'lawson',
    name: 'ローチケ',
    color: 'bg-sky-600',
    buildUrl: (q: string) => `https://l-tike.com/search/?keyword=${encodeURIComponent(q)}`,
  },
  {
    id: 'eplus',
    name: 'イープラス',
    color: 'bg-orange-500',
    buildUrl: (q: string) => `https://eplus.jp/sf/search?keyword=${encodeURIComponent(q)}`,
  },
  {
    id: 'rakuten',
    name: '楽天チケット',
    color: 'bg-rose-600',
    buildUrl: (q: string) => `https://ticket.rakuten.co.jp/?q=${encodeURIComponent(q)}`,
  },
] as const

const TICKET_CATEGORIES: ReadonlySet<EventCategory> = new Set(['music', 'sports', 'anime'])

export const shouldShowTicketLinks = (category: EventCategory): boolean => TICKET_CATEGORIES.has(category)
