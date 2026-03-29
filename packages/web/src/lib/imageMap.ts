import type { EventCategory, FacilityName } from '../types'

/** カテゴリ別シード文字列 (other を除く) — picsum.photos/seed/{seed}/300/200 に使用 */
const CATEGORY_SEEDS: Record<Exclude<EventCategory, 'other'>, string[]> = {
  music: [
    'ariake-music-concert',
    'ariake-music-stage',
    'ariake-music-festival',
    'ariake-music-hall',
    'ariake-music-theater',
    'ariake-music-venue',
  ],
  sports: [
    'ariake-sports-basketball',
    'ariake-sports-arena',
    'ariake-sports-court',
    'ariake-sports-gym',
    'ariake-sports-stadium',
    'ariake-sports-event',
  ],
  exhibition: [
    'ariake-exhibition-gallery',
    'ariake-exhibition-art',
    'ariake-exhibition-museum',
    'ariake-exhibition-display',
    'ariake-exhibition-expo',
    'ariake-exhibition-show',
  ],
  kids: [
    'ariake-kids-play',
    'ariake-kids-fun',
    'ariake-kids-event',
  ],
  food: [
    'ariake-food-spread',
    'ariake-food-meal',
    'ariake-food-market',
    'ariake-food-stall',
    'ariake-food-restaurant',
    'ariake-food-night',
  ],
  fashion: [
    'ariake-fashion-show',
    'ariake-fashion-style',
    'ariake-fashion-event',
  ],
  anime: [
    'ariake-anime-cosplay',
    'ariake-anime-convention',
    'ariake-anime-event',
  ],
}

/** other カテゴリ用: 施設別シード */
const FACILITY_SEEDS: Record<FacilityName, string[]> = {
  '有明ガーデン': [
    'ariake-garden-mall-0',
    'ariake-garden-mall-1',
    'ariake-garden-mall-2',
  ],
  '東京ガーデンシアター': [
    'ariake-garden-theater-0',
    'ariake-garden-theater-1',
    'ariake-garden-theater-2',
  ],
  '有明アリーナ': [
    'ariake-arena-0',
    'ariake-arena-1',
    'ariake-arena-2',
  ],
  'TOYOTA ARENA TOKYO': [
    'ariake-toyota-arena-0',
    'ariake-toyota-arena-1',
    'ariake-toyota-arena-2',
  ],
  '東京ビッグサイト': [
    'ariake-bigsight-0',
    'ariake-bigsight-1',
    'ariake-bigsight-2',
  ],
}

/**
 * イベントカテゴリ・ID・施設名から画像 URL を決定論的に返す。
 * picsum.photos のシードベース URL を使用（認証不要・常時安定）。
 * other カテゴリは施設画像を使用。施設不明の場合は null。
 */
export function getImageUrl(
  category: EventCategory,
  eventId: string,
  facility?: FacilityName,
): string | null {
  const numericSeed = [...eventId].reduce((sum, c) => sum + c.charCodeAt(0), 0)

  if (category === 'other') {
    if (!facility) return null
    const seeds = FACILITY_SEEDS[facility]
    if (!seeds) return null
    const seed = seeds[numericSeed % seeds.length]
    return `https://picsum.photos/seed/${seed}/300/200`
  }

  const seeds = CATEGORY_SEEDS[category]
  const seed = seeds[numericSeed % seeds.length]
  return `https://picsum.photos/seed/${seed}/300/200`
}
