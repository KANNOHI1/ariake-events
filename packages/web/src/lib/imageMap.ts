import type { EventItem, FacilityName } from '../types'

/** 施設名 → 静的施設写真パス */
const FACILITY_PHOTOS: Record<FacilityName, string> = {
  '有明ガーデン': '/facilities/ariake-garden.jpg',
  '東京ガーデンシアター': '/facilities/tokyo-garden-theater.webp',
  '有明アリーナ': '/facilities/ariake-arena.jpg',
  'TOYOTA ARENA TOKYO': '/facilities/toyota-arena.jpg',
  '東京ビッグサイト': '/facilities/tokyo-bigsight.jpg',
}

/**
 * イベントの画像 URL を返す。
 * 1. event.imageUrl があればそれを使う（スクレイピングで取得した実画像）
 * 2. なければ施設の静的写真にフォールバック
 */
export function getImageUrl(event: EventItem): string {
  if (event.imageUrl) return event.imageUrl
  return getFacilityPhoto(event.facility)
}

/** 施設写真のパスを返す（onError フォールバック用にも使用） */
export function getFacilityPhoto(facility: FacilityName): string {
  return FACILITY_PHOTOS[facility] ?? '/facilities/ariake-garden.jpg'
}
