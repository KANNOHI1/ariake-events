import type { EventItem } from '../types'

/**
 * Fetches events.json relative to basePath.
 * In dev (NEXT_PUBLIC_BASE_PATH=''), this is '/events.json'.
 * In prod (NEXT_PUBLIC_BASE_PATH='/ariake-events'), this is '/ariake-events/events.json'.
 */
export async function fetchEvents(): Promise<EventItem[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  const url = `${basePath}/events.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
  const data = await res.json()
  return data as EventItem[]
}
