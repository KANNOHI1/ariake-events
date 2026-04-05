import type { EventCategory } from '../types'

export const FACILITY_COLORS: Record<string, string> = {
  '有明ガーデン': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  '東京ガーデンシアター': 'bg-pink-100 text-pink-800 border border-pink-200',
  '有明アリーナ': 'bg-rose-100 text-rose-800 border border-rose-200',
  'TOYOTA ARENA TOKYO': 'bg-amber-100 text-amber-800 border border-amber-200',
  '東京ビッグサイト': 'bg-sky-100 text-sky-800 border border-sky-200',
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  music: 'bg-violet-100 text-violet-800',
  sports: 'bg-green-100 text-green-800',
  exhibition: 'bg-blue-100 text-blue-800',
  kids: 'bg-pink-100 text-pink-800',
  food: 'bg-orange-100 text-orange-800',
  fashion: 'bg-fuchsia-100 text-fuchsia-800',
  anime: 'bg-cyan-100 text-cyan-800',
  other: 'bg-slate-100 text-slate-600',
}

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

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'ミュージック',
  sports: 'スポーツ',
  exhibition: '展示会・イベント',
  kids: 'キッズ',
  food: 'フード',
  fashion: 'ファッション',
  anime: 'アニメ',
  other: 'その他',
}

export interface CongestionInfo {
  label: string
  imageBadgeClass: string
  badgeClass: string
  barClass: string
  barColorClass: string
}

export const getCongestionInfo = (score: number | null | undefined): CongestionInfo | null => {
  if (score == null || score <= 0) return null

  if (score < 0.3) {
    return {
      label: '空いている',
      imageBadgeClass: 'bg-emerald-500/90 text-white',
      badgeClass: 'bg-emerald-50 text-emerald-700',
      barClass: 'bg-emerald-400',
      barColorClass: 'bg-emerald-400',
    }
  }

  if (score < 0.6) {
    return {
      label: 'やや混雑',
      imageBadgeClass: 'bg-amber-500/90 text-white',
      badgeClass: 'bg-amber-50 text-amber-700',
      barClass: 'bg-amber-400',
      barColorClass: 'bg-amber-400',
    }
  }

  if (score < 0.8) {
    return {
      label: '混雑',
      imageBadgeClass: 'bg-orange-600/90 text-white',
      badgeClass: 'bg-orange-50 text-orange-700',
      barClass: 'bg-orange-400',
      barColorClass: 'bg-orange-400',
    }
  }

  return {
    label: '非常に混雑',
    imageBadgeClass: 'bg-rose-600/90 text-white',
    badgeClass: 'bg-rose-50 text-rose-700',
    barClass: 'bg-rose-500',
    barColorClass: 'bg-rose-500',
  }
}
