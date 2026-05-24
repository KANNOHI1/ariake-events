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
] as const

const TICKET_CATEGORIES: ReadonlySet<EventCategory> = new Set(['music', 'sports', 'anime'])

export const shouldShowTicketLinks = (category: EventCategory): boolean => TICKET_CATEGORIES.has(category)

/**
 * チケット検索用のクエリを整形する。
 * - 連続する重複フレーズを除去（例: 'DIR EN GREY DIR EN GREY MORTAL' → 'DIR EN GREY'）
 * - 括弧/引用符以降を切り捨て
 * - ツアー名や公演名の前で切り捨て
 * - 末尾に施設名を付与
 */
export const buildSearchQuery = (eventName: string, facility: string): string => {
  let query = eventName
    .trim()
    .replace(/[　\s]+/g, ' ')
    .replace(/\s*×\s*/g, ' × ')
    .trim()

  // Step 1: 連続重複フレーズ除去 — 'X X Y' → 'X'
  const dupMatch = query.match(/^(.+?)\s+\1(\s+.*)?$/)
  if (dupMatch) {
    query = dupMatch[1]
  }

  // Step 1b: 'X(...) X TOUR' → 'X'
  const parentheticalDupMatch = query.match(/^(.+?)\([^)]*\)\s+\1\b/i)
  if (parentheticalDupMatch) {
    query = parentheticalDupMatch[1]
  }

  // Step 2: 括弧/引用符以降を切り捨て（ASCII引用符は先頭に空白必須でBΛBY'S誤分割を防ぐ）
  const japaneseBracketMatch = query.match(/^(.+?)\s*[「『（［【＜〜]/)
  const quotedMatch = query.match(/^(.+?)\s+[\(\[\u201C"]/)
  if (japaneseBracketMatch) {
    query = japaneseBracketMatch[1]
  } else if (quotedMatch) {
    query = quotedMatch[1]
  }

  // Step 3: ツアーマーカー前で切り捨て
  const TOUR_MARKERS = [
    'LIVE',
    'TOUR',
    'CONCERT',
    'Arena',
    'ARENA',
    'Tour',
    'Live',
    'Concert',
    'Tours',
    'ANNIVERSARY',
    'Anniversary',
    'PRESENTS',
    'Presents',
    'presents',
    'Hall',
    'HALL',
    'Vol\\.?',
    'Cup',
    'ONEMAN',
    'FES',
    'FESTIVAL',
    'Festival',
    'ライブ',
    'ツアー',
    'フェス',
    'コンサート',
    '公演',
    '周年',
    'アニバーサリー',
    'シリーズ',
  ]
  const numMarker = '\\d+(?:st|nd|rd|th|周年)'
  const tourPattern = new RegExp(`^(.+?)(?=\\s+(?:${TOUR_MARKERS.join('|')}|${numMarker})\\s)`, 'i')
  const tourMatch = query.match(tourPattern)
  if (tourMatch) {
    query = tourMatch[1]
  }

  query = query.trim()

  // Step 4: 施設名付与（既に含まれていればスキップ）
  if (facility && !query.includes(facility)) {
    return `${query} ${facility}`
  }
  return query
}
