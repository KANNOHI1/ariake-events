// packages/web/src/components/TransportView.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TransportView from './TransportView'

// 現在時刻を固定（平日 14:30）
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-23T14:30:00')) // 月曜日
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TransportView', () => {
  it('renders all 4 route names', () => {
    render(<TransportView />)
    expect(screen.getByText('りんかい線')).toBeInTheDocument()
    expect(screen.getByText('ゆりかもめ')).toBeInTheDocument()
    expect(screen.getByText('都バス')).toBeInTheDocument()
    expect(screen.getByText('BRT')).toBeInTheDocument()
  })

  it('renders direction labels', () => {
    render(<TransportView />)
    expect(screen.getByText('大崎方面')).toBeInTheDocument()
    expect(screen.getByText('新木場方面')).toBeInTheDocument()
    expect(screen.getAllByText('新橋方面').length).toBeGreaterThan(0)
    expect(screen.getByText('豊洲方面')).toBeInTheDocument()
  })

  it('renders station name and walk time', () => {
    render(<TransportView />)
    expect(screen.getByText('有明テニスの森駅')).toBeInTheDocument()
    expect(screen.getByText('徒歩3分')).toBeInTheDocument()
  })

  it('shows only departures at or after current time', () => {
    render(<TransportView />)
    // 14:30以前の便は表示されない
    expect(screen.queryAllByText('06:17').length).toBe(0)
    // 14:34以降の便は表示される
    expect(screen.getAllByText('14:34').length).toBeGreaterThan(0)
  })

  it('shows weekday schedule on weekday', () => {
    // 2026-03-23は月曜日なので平日ダイヤ
    render(<TransportView />)
    // 平日ダイヤの時刻が存在することを確認（ゆりかもめ豊洲方面 14:34）
    expect(screen.getAllByText('14:34').length).toBeGreaterThan(0)
  })
})
