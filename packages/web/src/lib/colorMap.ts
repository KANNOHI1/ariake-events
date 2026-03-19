import type { EventCategory } from '../types'

/** Tailwind soft pastel classes for facility badges (below card image) */
export const FACILITY_COLORS: Record<string, string> = {
  '有明ガーデン': 'bg-emerald-50 text-emerald-700',
  '東京ガーデンシアター': 'bg-pink-50 text-pink-700',
  '有明アリーナ': 'bg-sky-50 text-sky-700',
  'TOYOTA ARENA TOKYO': 'bg-amber-50 text-amber-700',
  '東京ビッグサイト': 'bg-blue-50 text-blue-700',
}

/** Gradient classes for EventCard hero image area */
export const FACILITY_GRADIENTS: Record<string, string> = {
  '有明ガーデン': 'bg-gradient-to-br from-green-400 to-green-600',
  '東京ガーデンシアター': 'bg-gradient-to-br from-pink-400 to-rose-600',
  '有明アリーナ': 'bg-gradient-to-br from-sky-400 to-blue-600',
  'TOYOTA ARENA TOKYO': 'bg-gradient-to-br from-amber-400 to-orange-500',
  '東京ビッグサイト': 'bg-gradient-to-br from-blue-500 to-indigo-700',
}

/** Tailwind soft pastel classes for category badges */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  music: 'bg-indigo-50 text-indigo-700',
  sports: 'bg-emerald-50 text-emerald-700',
  exhibition: 'bg-purple-50 text-purple-700',
  kids: 'bg-pink-50 text-pink-700',
  food: 'bg-orange-50 text-orange-700',
  fashion: 'bg-fuchsia-50 text-fuchsia-700',
  anime: 'bg-cyan-50 text-cyan-700',
  other: 'bg-slate-100 text-slate-600',
}

/** Tailwind dot color classes for calendar view */
export const CATEGORY_DOT_COLORS: Record<EventCategory, string> = {
  music: 'bg-violet-500',
  sports: 'bg-emerald-500',
  exhibition: 'bg-amber-500',
  kids: 'bg-pink-500',
  food: 'bg-orange-500',
  fashion: 'bg-fuchsia-500',
  anime: 'bg-cyan-500',
  other: 'bg-slate-400',
}

/** Japanese labels for category tags */
export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'ミュージック',
  sports: 'スポーツ',
  exhibition: '展示・展覧',
  kids: 'キッズ',
  food: 'フード',
  fashion: 'ファッション',
  anime: 'アニメ',
  other: 'その他',
}

/** Congestion risk level info for a given score */
export interface CongestionInfo {
  label: string
  /** Tailwind bg class for image overlay badge (semi-transparent) */
  imageBadgeClass: string
  /** Tailwind classes for CalendarView badge */
  badgeClass: string
  /** Tailwind bg class for CalendarView cell bar */
  barClass: string
}

/**
 * Returns label and color info for a congestionRisk score.
 * Returns null if score is null, undefined, or 0.
 *
 * Ranges:
 *   0.0        → null
 *   0.0 < s < 0.3  → 空いている (emerald)
 *   0.3 ≤ s < 0.6  → やや混雑 (amber)
 *   0.6 ≤ s < 0.8  → 混雑 (orange)
 *   0.8 ≤ s ≤ 1.0  → 非常に混雑 (rose)
 */
export const getCongestionInfo = (score: number | null | undefined): CongestionInfo | null => {
  if (score == null || score <= 0) return null
  if (score < 0.3) return { label: '空いている',  imageBadgeClass: 'bg-emerald-500/90', badgeClass: 'bg-emerald-50 text-emerald-700', barClass: 'bg-emerald-400' }
  if (score < 0.6) return { label: 'やや混雑',    imageBadgeClass: 'bg-amber-500/90',   badgeClass: 'bg-amber-50 text-amber-700',   barClass: 'bg-amber-400'   }
  if (score < 0.8) return { label: '混雑',        imageBadgeClass: 'bg-orange-600/90',  badgeClass: 'bg-orange-50 text-orange-700', barClass: 'bg-orange-400'  }
  return               { label: '非常に混雑',  imageBadgeClass: 'bg-rose-600/90',    badgeClass: 'bg-rose-50 text-rose-700',     barClass: 'bg-rose-500'    }
}
