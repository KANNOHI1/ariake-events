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

/**
 * チケット検索用のクエリを整形する。
 * - 連続する重複フレーズを除去（例: 'DIR EN GREY DIR EN GREY MORTAL' → 'DIR EN GREY'）
 * - 括弧（「『（［【＜<）以降を切り捨て
 * - 末尾に施設名を付与
 */
export const buildSearchQuery = (eventName: string, facility: string): string => {
  let query = eventName.trim()

  // Step 1: 連続する重複フレーズ検出 — 'X X Y' → 'X'
  const dupMatch = query.match(/^(.+?)\s+\1(\s+.*)?$/)
  if (dupMatch) {
    query = dupMatch[1]
  }

  // Step 2: 括弧以降を切り捨て
  const bracketMatch = query.match(/^(.+?)\s*[「『（［【＜<\(\[]/)
  if (bracketMatch) {
    query = bracketMatch[1]
  }

  query = query.trim()

  // Step 3: 施設名を付与（既に含まれていればスキップ）
  if (facility && !query.includes(facility)) {
    return `${query} ${facility}`
  }
  return query
}
