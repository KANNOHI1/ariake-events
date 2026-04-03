'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterBar from '../components/FilterBar'
import type { ViewMode } from '../components/FilterBar'
import BottomNav from '../components/BottomNav'
import TodayView from '../components/TodayView'
import MonthView from '../components/MonthView'
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
import { getTodayString } from '../lib/dateUtils'

export default function HomeContent() {
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<EventItem[]>([])
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams)
  )
  const [activeView, setActiveView] = useState<ViewType>('today')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('viewMode') as ViewMode) ?? 'list'
    }
    return 'list'
  })

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const next: ViewMode = prev === 'list' ? 'grid' : 'list'
      localStorage.setItem('viewMode', next)
      return next
    })
  }, [])

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

  const todayEvents = useMemo(
    () => filterEvents(events, filters, today, today),
    [events, filters, today]
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
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-primary-500">有明</span>
            <span className="text-slate-900">イベント</span>
          </h1>
          <span className="text-sm font-semibold text-primary-500 bg-[#fff3ed] px-3 py-1 rounded-full">
            {dateLabel}
          </span>
        </div>
      </header>

      {activeView !== 'transport' && (
        <div className="max-w-5xl mx-auto w-full">
          <FilterBar
            filters={filters}
            onSetFacility={setFacility}
            onSetCategory={setCategory}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
          />
        </div>
      )}

      <main className="max-w-5xl mx-auto">
        {activeView === 'today' && (
          <TodayView events={todayEvents} onResetFilters={resetFilters} viewMode={viewMode} />
        )}
        {activeView === 'month' && (
          <MonthView events={calendarEvents} onResetFilters={resetFilters} viewMode={viewMode} />
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
