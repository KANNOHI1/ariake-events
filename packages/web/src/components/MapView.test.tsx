import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MapView from './MapView'
import type { RouteData } from '../data/timetable'

vi.mock('leaflet/dist/leaflet.css', () => ({}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => (
    <div data-testid="circle-marker">{children}</div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const routes: RouteData[] = [
  {
    name: 'りんかい線',
    station: '有明テニスの森駅',
    walkMinutes: 3,
    tabGroup: 'rail',
    stops: ['大崎', '国際展示場★', '新木場'],
    coords: { lat: 35.62952, lng: 139.79486 },
    directions: [],
  },
  {
    name: '都バス',
    station: '有明テニスの森停留所',
    walkMinutes: 2,
    tabGroup: 'bus',
    stops: ['東陽町', '有明テニスの森★', '有明北ふ頭'],
    coords: { lat: 35.6295, lng: 139.7915 },
    directions: [],
  },
  {
    name: 'BRT',
    station: '有明BRT停留所',
    walkMinutes: 2,
    tabGroup: 'brt',
    stops: ['新橋', '有明BRT★'],
    coords: { lat: 35.636, lng: 139.794 },
    directions: [],
  },
]

describe('MapView', () => {
  it('all フィルターでは全マーカーを表示する', () => {
    render(<MapView routes={routes} activeFilter="all" />)

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getAllByTestId('circle-marker')).toHaveLength(3)
  })

  it('rail フィルターでは鉄道マーカーのみ表示する', () => {
    render(<MapView routes={routes} activeFilter="rail" />)

    expect(screen.getAllByTestId('circle-marker')).toHaveLength(1)
    expect(screen.getByText('有明テニスの森駅')).toBeInTheDocument()
  })

  it('brt フィルターでは BRT マーカーのみ表示する', () => {
    render(<MapView routes={routes} activeFilter="brt" />)

    expect(screen.getAllByTestId('circle-marker')).toHaveLength(1)
    expect(screen.getByText('有明BRT停留所')).toBeInTheDocument()
  })
})
