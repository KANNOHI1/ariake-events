'use client'

import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { RouteData } from '../data/timetable'

interface Props {
  routes: RouteData[]
  activeFilter: 'all' | 'rail' | 'brt' | 'bus'
}

const COLORS: Record<RouteData['tabGroup'], string> = {
  rail: '#1e3a5f',
  brt: '#16a34a',
  bus: '#f97316',
}

export default function MapView({ routes, activeFilter }: Props) {
  const visibleRoutes =
    activeFilter === 'all' ? routes : routes.filter((route) => route.tabGroup === activeFilter)

  return (
    <MapContainer center={[35.6345, 139.793]} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visibleRoutes.map((route) => (
        <CircleMarker
          key={`${route.name}-${route.station}`}
          center={[route.coords.lat, route.coords.lng]}
          pathOptions={{ color: COLORS[route.tabGroup], fillColor: COLORS[route.tabGroup], fillOpacity: 0.9 }}
          radius={10}
        >
          <Popup>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{route.station}</p>
              <p className="text-xs text-slate-600">{route.name}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
