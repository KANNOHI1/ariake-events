import type { EventCategory } from '../types'

const BASE = 'https://images.unsplash.com/photo-'
const PARAMS = '?w=300&h=200&fit=crop'

const CATEGORY_IMAGES: Record<Exclude<EventCategory, 'other'>, [string, string, string]> = {
  music:      ['1493225457124-a3eb161ffa5f', '1429962714451-bb934ecdc4ec', '1501386760234-c2f1b64d4d8f'],
  sports:     ['1571019613454-1cb2f99b2d8b', '1461896836934-ffe607ba8211', '1547347298-4074ad3086f0'],
  exhibition: ['1540575467063-178a50c2df87', '1578662996442-48f60103fc96', '1565035010268-a3816f98589a'],
  kids:       ['1503454537195-1f28bea0f5cc', '1515488042361-ee00e0ddd4e4', '1476703993599-0035a21b9fc3'],
  food:       ['1414235077428-338989a2e8c0', '1504674900247-0877df9cc836', '1555396273-367ea4eb4db5'],
  fashion:    ['1558769132-cb1aea458c5e', '1509631179647-0177331693ae', '1483985988355-763728e1cdc6'],
  anime:      ['1578632767115-351597cf2a57', '1612198188060-c7c2a3b66eae', '1560169897-fc0cdbdfa4d5'],
}

/**
 * Returns a deterministic Unsplash image URL for the given category and eventId.
 * Returns null for the 'other' category (no photo, use icon instead).
 */
export function getImageUrl(category: EventCategory, eventId: string): string | null {
  if (category === 'other') return null
  const photos = CATEGORY_IMAGES[category]
  const seed = [...eventId].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 3
  return `${BASE}${photos[seed]}${PARAMS}`
}
