import type { EventCategory } from '../types'

/** Tailwind classes for facility badges (rounded-full) */
export const FACILITY_COLORS: Record<string, string> = {
  '有明ガーデン': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  '東京ガーデンシアター': 'bg-violet-100 text-violet-700 border border-violet-200',
  '有明アリーナ': 'bg-sky-100 text-sky-700 border border-sky-200',
  'TOYOTA ARENA TOKYO': 'bg-amber-100 text-amber-700 border border-amber-200',
  '東京ビッグサイト': 'bg-rose-100 text-rose-700 border border-rose-200',
}

/** Tailwind bg+text classes for category tags (rounded-md) */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  music: 'bg-violet-100 text-violet-700',
  sports: 'bg-emerald-100 text-emerald-700',
  exhibition: 'bg-amber-100 text-amber-700',
  kids: 'bg-pink-100 text-pink-700',
  food: 'bg-orange-100 text-orange-700',
  fashion: 'bg-fuchsia-100 text-fuchsia-700',
  anime: 'bg-cyan-100 text-cyan-700',
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
  /** Tailwind classes for EventCard badge: "bg-emerald-50 text-emerald-700" etc. */
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
  if (score < 0.3) return { label: '空いている',  badgeClass: 'bg-emerald-50 text-emerald-700', barClass: 'bg-emerald-400' }
  if (score < 0.6) return { label: 'やや混雑',    badgeClass: 'bg-amber-50 text-amber-700',   barClass: 'bg-amber-400'   }
  if (score < 0.8) return { label: '混雑',        badgeClass: 'bg-orange-50 text-orange-700', barClass: 'bg-orange-400'  }
  return               { label: '非常に混雑',  badgeClass: 'bg-rose-50 text-rose-700',     barClass: 'bg-rose-500'    }
}
