import type { EventCategory } from '../types'

/** Tailwind solid fill classes for facility badges */
export const FACILITY_COLORS: Record<string, string> = {
  '有明ガーデン': 'bg-green-600 text-white',
  '東京ガーデンシアター': 'bg-pink-600 text-white',
  '有明アリーナ': 'bg-sky-600 text-white',
  'TOYOTA ARENA TOKYO': 'bg-amber-500 text-white',
  '東京ビッグサイト': 'bg-blue-600 text-white',
}

/** Gradient classes for EventCard header area */
export const FACILITY_GRADIENTS: Record<string, string> = {
  '有明ガーデン': 'bg-gradient-to-br from-green-400 to-green-600',
  '東京ガーデンシアター': 'bg-gradient-to-br from-pink-400 to-rose-600',
  '有明アリーナ': 'bg-gradient-to-br from-sky-400 to-blue-600',
  'TOYOTA ARENA TOKYO': 'bg-gradient-to-br from-amber-400 to-orange-500',
  '東京ビッグサイト': 'bg-gradient-to-br from-blue-500 to-indigo-700',
}

/** Tailwind solid fill classes for category badges */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  music: 'bg-indigo-600 text-white',
  sports: 'bg-green-600 text-white',
  exhibition: 'bg-purple-600 text-white',
  kids: 'bg-pink-500 text-white',
  food: 'bg-orange-500 text-white',
  fashion: 'bg-fuchsia-600 text-white',
  anime: 'bg-cyan-600 text-white',
  other: 'bg-slate-500 text-white',
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
  /** Tailwind bg class for EventCard dot indicator */
  dotClass: string
  /** Tailwind text class for EventCard congestion label */
  textClass: string
  /** Tailwind classes for CalendarView badge: "bg-emerald-50 text-emerald-700" etc. */
  badgeClass: string
  /** Tailwind bg class for CalendarView cell bar: "bg-emerald-400" etc. */
  barClass: string
}

/**
 * Returns label and color info for a congestionRisk score.
 * Returns null if score is null, undefined, or 0 (no events / no risk).
 *
 * Ranges (spec: docs/archive/specs/2026-03-19-phase4-congestion-design.md):
 *   0.0        → null (no display)
 *   0.0 < s < 0.3  → 空いている (emerald)
 *   0.3 ≤ s < 0.6  → やや混雑 (amber)
 *   0.6 ≤ s < 0.8  → 混雑 (orange)
 *   0.8 ≤ s ≤ 1.0  → 非常に混雑 (rose)
 */
export const getCongestionInfo = (score: number | null | undefined): CongestionInfo | null => {
  if (score == null || score <= 0) return null
  if (score < 0.3) return { label: '空いている',  dotClass: 'bg-emerald-500', textClass: 'text-emerald-700', badgeClass: 'bg-emerald-50 text-emerald-700', barClass: 'bg-emerald-400' }
  if (score < 0.6) return { label: 'やや混雑',    dotClass: 'bg-amber-500',   textClass: 'text-amber-700',   badgeClass: 'bg-amber-50 text-amber-700',   barClass: 'bg-amber-400'   }
  if (score < 0.8) return { label: '混雑',        dotClass: 'bg-orange-500',  textClass: 'text-orange-700',  badgeClass: 'bg-orange-50 text-orange-700', barClass: 'bg-orange-400'  }
  return               { label: '非常に混雑',  dotClass: 'bg-rose-500',    textClass: 'text-rose-700',    badgeClass: 'bg-rose-50 text-rose-700',     barClass: 'bg-rose-500'    }
}
