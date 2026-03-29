import type { EventItem, FacilityName } from '../types'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** 施設名 → 静的施設写真パス */
const FACILITY_PHOTOS: Record<FacilityName, string> = {
  '有明ガーデン': `${BASE_PATH}/facilities/ariake-garden.jpg`,
  '東京ガーデンシアター': `${BASE_PATH}/facilities/tokyo-garden-theater.webp`,
  '有明アリーナ': `${BASE_PATH}/facilities/ariake-arena.jpg`,
  'TOYOTA ARENA TOKYO': `${BASE_PATH}/facilities/toyota-arena.jpg`,
  '東京ビッグサイト': `${BASE_PATH}/facilities/tokyo-bigsight.jpg`,
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
  return FACILITY_PHOTOS[facility] ?? `${BASE_PATH}/facilities/ariake-garden.jpg`
}
