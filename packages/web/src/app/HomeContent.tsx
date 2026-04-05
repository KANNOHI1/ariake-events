'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterBar from '../components/FilterBar'
import type { ViewMode } from '../components/FilterBar'
import BottomNav from '../components/BottomNav'
import DayView from '../components/DayView'
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
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary-500">有明</span>
            <span className="text-near-black">イベント</span>
          </h1>
          <span className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-500">
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
          <DayView events={calendarEvents} onResetFilters={resetFilters} viewMode={viewMode} />
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
