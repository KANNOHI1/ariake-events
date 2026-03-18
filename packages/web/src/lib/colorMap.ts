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
