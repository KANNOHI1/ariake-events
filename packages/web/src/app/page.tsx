'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterBar from '../components/FilterBar'
import ViewTabs from '../components/ViewTabs'
import TodayView from '../components/TodayView'
import WeekView from '../components/WeekView'
import CalendarView from '../components/CalendarView'
import type { ViewType } from '../components/ViewTabs'
import type { EventItem } from '../types'
import type { FilterState } from '../lib/filter'
import {
  getDefaultFilters,
  filterEvents,
  parseFiltersFromParams,
  filtersToParams,
} from '../lib/filter'
import { fetchEvents } from '../lib/events'
import { getTodayString, getWeekRange } from '../lib/dateUtils'

function HomeContent() {
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<EventItem[]>([])
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams)
  )
  const [activeView, setActiveView] = useState<ViewType>('today')
  const [loading, setLoading] = useState(true)

  // Load events on mount
  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Sync filter state to URL (side effect)
  useEffect(() => {
    const qs = filtersToParams(filters)
    window.history.replaceState(null, '', qs || window.location.pathname)
  }, [filters])

  const toggleFacility = useCallback((facility: string) => {
    setFilters((prev) =>
      prev.facilities.includes(facility)
        ? { ...prev, facilities: prev.facilities.filter((f) => f !== facility) }
        : { ...prev, facilities: [...prev.facilities, facility] }
    )
  }, [])

  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) =>
      prev.categories.includes(category as any)
        ? { ...prev, categories: prev.categories.filter((c) => c !== category) }
        : { ...prev, categories: [...prev.categories, category as any] }
    )
  }, [])

  const selectAll = useCallback(() => {
    setFilters(getDefaultFilters())
  }, [])

  const deselectAll = useCallback(() => {
    setFilters({ facilities: [], categories: [] })
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

  // Calendar shows all events matching facility/category filters (no date range restriction)
  const calendarEvents = useMemo(
    () => filterEvents(events, filters, '1900-01-01', '2999-12-31'),
    [events, filters]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <h1 className="text-xl font-bold text-slate-900">有明イベント情報</h1>
        <p className="text-xs text-slate-500 mt-0.5">有明エリア5施設のイベントをまとめて確認</p>
      </header>

      <FilterBar
        filters={filters}
        onToggleFacility={toggleFacility}
        onToggleCategory={toggleCategory}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
      />

      <ViewTabs activeView={activeView} onChangeView={setActiveView} />

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
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500">読み込み中...</div>}>
      <HomeContent />
    </Suspense>
  )
}
