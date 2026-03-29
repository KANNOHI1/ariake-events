import type { EventCategory, FacilityName } from '../types'

const BASE = 'https://images.unsplash.com/photo-'
const PARAMS = '?w=300&h=200&fit=crop'

/** カテゴリ別画像 (other を除く) */
const CATEGORY_IMAGES: Record<Exclude<EventCategory, 'other'>, string[]> = {
  music: [
    '1493225457124-a3eb161ffa5f', // concert crowd
    '1429962714451-bb934ecdc4ec', // performer on stage
    '1501386760234-c2f1b64d4d8f', // music festival
    '23-K-S-jUC0',               // concert hall interior
    'st8-LqxyaaI',               // theater hall
    'sAT8-xnZFCA',               // concert venue
  ],
  sports: [
    'XmYSlYrupL8',   // basketball court with crowd
    'w28ybVE1lQM',   // basketball court overhead
    'ggtFONGaWTo',   // basketball court beige/blue
    'J_tbkGWxCH0',   // basketball gym
    '4f0AIAtqq7Q',   // basketball game in arena
    'k7JFRw2keyo',   // arena seating
  ],
  exhibition: [
    'PmF9EcHvFB0',   // gallery with paintings
    'vOKvkIf_4QI',   // woman viewing large painting
    'uJCubgWo-0E',   // museum wall painting
    'lolqEsxs7Ws',   // sculpture in red room
    'z572EVhWfeY',   // woman before artwork
    'TvPo0J7Pjrw',   // spotlight on framed artwork
  ],
  kids: [
    '1503454537195-1f28bea0f5cc',
    '1515488042361-ee00e0ddd4e4',
    '1476703993599-0035a21b9fc3',
  ],
  food: [
    '1414235077428-338989a2e8c0', // food spread
    '1504674900247-0877df9cc836', // meal
    '1555396273-367ea4eb4db5',    // food market
    'g5e7NeX-OaE',               // food stall
    '464wIqxhDXw',               // restaurant bar
    'ItUQBmCEKes',               // night market
  ],
  fashion: [
    '1558769132-cb1aea458c5e',
    '1509631179647-0177331693ae',
    '1483985988355-763728e1cdc6',
  ],
  anime: [
    '1578632767115-351597cf2a57',
    '1612198188060-c7c2a3b66eae',
    '1560169897-fc0cdbdfa4d5',
  ],
}

/** other カテゴリ用: 施設別画像 */
const FACILITY_IMAGES: Record<FacilityName, string[]> = {
  '有明ガーデン': [
    'oGhTfu1UrOY', // shopping mall interior
    '73G3F3VHLQk', // mall atrium
    'i8u5gz-ZeIc', // shopping complex
  ],
  '東京ガーデンシアター': [
    '23-K-S-jUC0', // concert hall
    'st8-LqxyaaI', // theater interior
    'W41tEgqtjiI', // venue interior
  ],
  '有明アリーナ': [
    'k7JFRw2keyo', // arena seating
    '4f0AIAtqq7Q', // arena event
    'XmYSlYrupL8', // court interior
  ],
  'TOYOTA ARENA TOKYO': [
    'XmYSlYrupL8', // basketball court
    'ggtFONGaWTo', // basketball court
    'J_tbkGWxCH0', // basketball gym
  ],
  '東京ビッグサイト': [
    'PmF9EcHvFB0', // exhibition hall
    'uJCubgWo-0E', // gallery interior
    'lolqEsxs7Ws', // exhibit room
  ],
}

/**
 * イベントカテゴリ・ID・施設名から Unsplash 画像 URL を決定論的に返す。
 * other カテゴリは施設画像を使用。施設不明の場合は null。
 */
export function getImageUrl(
  category: EventCategory,
  eventId: string,
  facility?: FacilityName,
): string | null {
  const seed = [...eventId].reduce((sum, c) => sum + c.charCodeAt(0), 0)

  if (category === 'other') {
    if (!facility) return null
    const photos = FACILITY_IMAGES[facility]
    if (!photos) return null
    return `${BASE}${photos[seed % photos.length]}${PARAMS}`
  }

  const photos = CATEGORY_IMAGES[category]
  return `${BASE}${photos[seed % photos.length]}${PARAMS}`
}
