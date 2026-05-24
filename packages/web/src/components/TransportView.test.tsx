import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TransportView from './TransportView'

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="map-view" />,
}))

vi.mock('./MapView', () => ({
  default: () => <div data-testid="map-view" />,
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-06T14:30:00+09:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TransportView タブ', () => {
  it('タブに鉄道、BRT、バスが表示される', () => {
    render(<TransportView />)

    expect(screen.getByRole('tab', { name: '鉄道' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'BRT' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'バス' })).toBeInTheDocument()
  })

  it('初期表示は鉄道タブ', () => {
    render(<TransportView />)

    expect(screen.getByText('りんかい線')).toBeInTheDocument()
    expect(screen.getByText('ゆりかもめ')).toBeInTheDocument()
    expect(screen.queryByText('有明BRT停留所')).not.toBeInTheDocument()
  })

  it('BRTタブをクリックするとBRTが表示される', () => {
    render(<TransportView />)

    fireEvent.click(screen.getByRole('tab', { name: 'BRT' }))

    expect(screen.getByText('有明BRT停留所')).toBeInTheDocument()
    expect(screen.queryByText('りんかい線')).not.toBeInTheDocument()
  })

  it('バスタブをクリックするとバス路線が表示される', () => {
    render(<TransportView />)

    fireEvent.click(screen.getByRole('tab', { name: 'バス' }))

    expect(screen.getByText('都バス')).toBeInTheDocument()
    expect(screen.queryByText('りんかい線')).not.toBeInTheDocument()
  })
})

describe('TransportView 時刻フィルタ', () => {
  it('現在時刻より前の便は表示されない', () => {
    render(<TransportView />)

    expect(screen.queryAllByText('09:01')).toHaveLength(0)
  })

  it('現在時刻以降の便は表示される', () => {
    render(<TransportView />)

    expect(screen.getAllByText('14:34').length).toBeGreaterThan(0)
  })
})

describe('TransportView 土曜ダイヤ', () => {
  it('土曜日は土曜ダイヤを表示する', () => {
    vi.setSystemTime(new Date('2026-04-11T09:00:00+09:00'))
    render(<TransportView />)

    fireEvent.click(screen.getByRole('tab', { name: 'バス' }))

    const route = screen.getAllByText('海01')[0]
    const card = route.closest('article')

    expect(card).not.toBeNull()
    expect(within(card as HTMLElement).getByText('09:02')).toBeInTheDocument()
  })
})

describe('TransportView 路線情報', () => {
  it('駅名と徒歩分数が表示される', () => {
    render(<TransportView />)

    expect(screen.getByText('有明テニスの森駅')).toBeInTheDocument()
    expect(screen.getByText('徒歩3分')).toBeInTheDocument()
  })

  it('終電後は終了メッセージを表示する', () => {
    vi.setSystemTime(new Date('2026-04-06T23:59:00+09:00'))
    render(<TransportView />)

    expect(screen.getAllByText('本日の終電は終了しました').length).toBeGreaterThan(0)
  })
})

describe('TransportView A案切り替え', () => {
  it('マップボタンでマップモードに切り替わる', () => {
    render(<TransportView />)

    fireEvent.click(screen.getByRole('button', { name: '📍 マップ' }))

    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  it('マップモードではフィルターボタンが表示される', () => {
    render(<TransportView />)

    fireEvent.click(screen.getByRole('button', { name: '📍 マップ' }))

    expect(screen.getByRole('button', { name: '全て' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '鉄道' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'BRT' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'バス' })).toBeInTheDocument()
  })

  it('時刻表ボタンで時刻表モードに戻る', () => {
    render(<TransportView />)

    fireEvent.click(screen.getByRole('button', { name: '📍 マップ' }))
    fireEvent.click(screen.getByRole('button', { name: '🕐 時刻表' }))

    expect(screen.queryByTestId('map-view')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '鉄道' })).toBeInTheDocument()
  })

  it('時刻表モードで停留所一覧を見るボタンが表示される', () => {
    render(<TransportView />)

    expect(screen.getAllByRole('button', { name: '停留所一覧を見る ▼' }).length).toBeGreaterThan(0)
  })

  it('停留所一覧を見るをクリックすると停留所チップが展開される', () => {
    render(<TransportView />)

    fireEvent.click(screen.getAllByRole('button', { name: '停留所一覧を見る ▼' })[0])

    expect(screen.getByText('国際展示場★')).toBeInTheDocument()
    expect(screen.getByText('新木場')).toBeInTheDocument()
  })
})
