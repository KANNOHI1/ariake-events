'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterBar from '../components/FilterBar'
import BottomNav from '../components/BottomNav'
import TodayView from '../components/TodayView'
import WeekView from '../components/WeekView'
import CalendarView from '../components/CalendarView'
import dynamic from 'next/dynamic'
const TransportView = dynamic(() => import('../components/TransportView'), { ssr: false })
import type { ViewType } from '../components/ViewTabs'
import type { EventItem, EventCategory } from '../types'
import type { FilterState } from '../lib/filter'
import {
  getDefaultFilters,
  filterEvents,
  parseFiltersFromParams,
  filtersToParams,
} from '../lib/filter'
import { fetchEvents } from '../lib/events'
import { getTodayString, getWeekRange } from '../lib/dateUtils'

export default function HomeContent() {
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<EventItem[]>([])
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams)
  )
  const [activeView, setActiveView] = useState<ViewType>('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const qs = filtersToParams(filters)
    window.history.replaceState(null, '', qs || window.location.pathname)
  }, [filters])

  const setFacility = useCallback((facility: string | null) => {
    setFilters((prev) => ({ ...prev, facility }))
  }, [])

  const setCategory = useCallback((category: EventCategory | null) => {
    setFilters((prev) => ({ ...prev, category }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters())
  }, [])

  const today = getTodayString()
  const { start: weekStart, end: weekEnd } = getWeekRange(today)

  const todayEvents = useMemo(
    () => filterEvents(events, filters, today, today),
    [events, filters, today]
  )

  const weekEvents = useMemo(
    () => filterEvents(events, filters, weekStart, weekEnd),
    [events, filters, weekStart, weekEnd]
  )

  const calendarEvents = useMemo(
    () => filterEvents(events, filters, '1900-01-01', '2999-12-31'),
    [events, filters]
  )

  const dateLabel = new Date().toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f6] pb-20">
      {/* Sticky header with glassmorphism */}
      <header className="sticky top-0 z-50 bg-[#f8f6f6]/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">有明イベント</h1>
          <p className="text-sm font-medium text-primary-500">{dateLabel}</p>
        </div>
      </header>

      {activeView !== 'transport' && (
        <FilterBar
          filters={filters}
          onSetFacility={setFacility}
          onSetCategory={setCategory}
        />
      )}

      <main className="max-w-6xl mx-auto">
        {activeView === 'today' && (
          <TodayView events={todayEvents} onResetFilters={resetFilters} />
        )}
        {activeView === 'week' && (
          <WeekView events={weekEvents} onResetFilters={resetFilters} />
        )}
        {activeView === 'calendar' && (
          <CalendarView events={calendarEvents} onResetFilters={resetFilters} />
        )}
        {activeView === 'transport' && <TransportView />}
      </main>

      <BottomNav activeView={activeView} onChangeView={setActiveView} />
    </div>
  )
}
