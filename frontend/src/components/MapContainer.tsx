import { useEffect, useMemo, useRef } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Spot } from '../types'
import { SpotPopup } from './SpotPopup'

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl

// 创建自定义图标
const createIcon = (canCengFan: boolean) => {
  const color = canCengFan ? '#22c55e' : '#9ca3af' // 绿色=可蹭饭, 灰色=不可蹭饭
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${color}"/>
        <circle cx="16" cy="14" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}



interface MapContainerProps {
  spots: Spot[]
  selectedSpot: Spot | null
  onSelectSpot: (spot: Spot | null) => void
}

function MapController({ selectedSpot }: { selectedSpot: Spot | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedSpot) {
      map.flyTo([selectedSpot.location.lat, selectedSpot.location.lng], 12, {
        duration: 1,
      })
    }
  }, [selectedSpot, map])

  return null
}

export function MapContainer({ spots, selectedSpot, onSelectSpot }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)

  // 默认中心点 - 中国
  const defaultCenter: [number, number] = [35.8617, 104.1954]
  const defaultZoom = 4

  // 记忆化图标
  const iconCache = useMemo(() => {
    const cache = new Map<string, L.DivIcon>()
    return (canCengFan: boolean) => {
      const key = canCengFan ? 'green' : 'gray'
      if (!cache.has(key)) {
        cache.set(key, createIcon(canCengFan))
      }
      return cache.get(key)!
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      <LeafletMapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* 地图控制器 */}
        <MapController selectedSpot={selectedSpot} />

        {/* 渲染所有点位 */}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.location.lat, spot.location.lng]}
            icon={iconCache(spot.canCengFan)}
            eventHandlers={{
              click: () => onSelectSpot(spot),
            }}
          >
            <Popup className="spot-popup">
              <SpotPopup spot={spot} />
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>

      {/* 图例 */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 z-[1000]">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>可蹭饭</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>不可蹭饭</span>
          </div>
        </div>
      </div>
    </div>
  )
}
