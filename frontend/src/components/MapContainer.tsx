import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Spot } from '../types'
import { SpotPopup } from './SpotPopup'

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl

// 创建清新风格的图标 - 绿色系表示欢迎拜访（南京农业大学风格）
const createIcon = (canCengFan: boolean, isHovered: boolean = false) => {
  // 清新配色：欢迎拜访用绿色渐变，仅标记用淡蓝灰
  const primaryColor = canCengFan ? '#22c55e' : '#94a3b8' // 绿色 vs 灰蓝
  const secondaryColor = canCengFan ? '#10b981' : '#cbd5e1' // 深绿 vs 淡灰
  const size = isHovered ? 38 : 32
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; animation: ${isHovered ? 'bounce 0.5s ease-in-out' : 'float 3s ease-in-out infinite'}">
        <svg width="${size}" height="${size + 8}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${canCengFan ? 'green' : 'gray'}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
            </linearGradient>
            <filter id="shadow-${canCengFan ? 'green' : 'gray'}">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${primaryColor}" flood-opacity="0.3"/>
            </filter>
          </defs>
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" 
                fill="url(#grad-${canCengFan ? 'green' : 'gray'})" 
                filter="url(#shadow-${canCengFan ? 'green' : 'gray'})"/>
          <circle cx="16" cy="14" r="6" fill="white" opacity="0.9"/>
          ${canCengFan ? '<text x="16" y="17" text-anchor="middle" font-size="8" fill="#22c55e">👋</text>' : ''}
        </svg>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  })
}

interface MapContainerProps {
  spots: Spot[]
  selectedSpot: Spot | null
  onSelectSpot: (spot: Spot | null) => void
}

function MapController({ selectedSpot }: { selectedSpot: Spot | null }) {
  const map = useMap()

  // 点击点位时只移动到位置，不放大
  useEffect(() => {
    if (selectedSpot) {
      map.panTo([selectedSpot.location.lat, selectedSpot.location.lng], {
        duration: 1,
      })
    }
  }, [selectedSpot, map])

  return null
}

// 重置视图按钮组件
function ResetViewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 right-4 z-[1000] bg-white/90 hover:bg-white text-gray-700 p-3 rounded-xl shadow-lg border border-green-100 transition-all hover:scale-105 backdrop-blur-sm"
      title="重置视图"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </button>
  )
}

// 悬停信息卡片组件
function HoverCard({ spot }: { spot: Spot }) {
  return (
    <div className="absolute z-[1500] pointer-events-none transform -translate-x-1/2 -translate-y-full"
         style={{ left: '50%', top: '-10px' }}>
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl px-3 py-2 border border-green-100 min-w-[160px]">
        {/* 姓名 */}
        <div className="font-bold text-gray-900 flex items-center gap-1 mb-1 text-sm">
          <span>👋</span>
          {spot.name}
        </div>
        
        {/* 简要信息 */}
        <div className="text-xs text-gray-600 space-y-0.5">
          <div className="flex items-center gap-1">
            <span>🌍</span>
            <span>{spot.country} · {spot.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏫</span>
            <span className="truncate">{spot.school}</span>
          </div>
          {spot.major && (
            <div className="flex items-center gap-1">
              <span>📚</span>
              <span className="truncate text-green-600">{spot.major}</span>
            </div>
          )}
        </div>
        
        {/* 状态标签 */}
        <div className="mt-1.5 flex justify-center">
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            spot.canCengFan 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {spot.canCengFan ? '欢迎拜访 🎉' : '仅标记'}
          </span>
        </div>
      </div>
      {/* 小三角 */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95"></div>
      </div>
    </div>
  )
}

export function MapContainer({ spots, selectedSpot, onSelectSpot }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [hoveredSpot, setHoveredSpot] = useState<Spot | null>(null)

  // 默认中心点 - 中国
  const defaultCenter: [number, number] = [35.8617, 104.1954]
  const defaultZoom = 4

  // 重置视图到默认位置
  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView(defaultCenter, defaultZoom, { duration: 1 })
      onSelectSpot(null) // 清除选中的点位
    }
  }, [onSelectSpot])

  // 记忆化图标
  const getIcon = useMemo(() => {
    const cache = new Map<string, L.DivIcon>()
    return (canCengFan: boolean, isHovered: boolean = false) => {
      const key = `${canCengFan}-${isHovered}`
      if (!cache.has(key)) {
        cache.set(key, createIcon(canCengFan, isHovered))
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
        {/* 使用更清新的地图样式 */}
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
            icon={getIcon(spot.canCengFan, hoveredSpot?.id === spot.id)}
            eventHandlers={{
              click: () => onSelectSpot(spot),
              mouseover: () => setHoveredSpot(spot),
              mouseout: () => setHoveredSpot(null),
            }}
          >
            <Popup className="spot-popup">
              <SpotPopup spot={spot} />
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>

      {/* 图例 - 清新风格 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg px-4 py-3 z-[1000] border border-green-100">
        <div className="text-sm font-medium text-gray-700 mb-2">📍 点位说明</div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-md"></div>
            <span className="text-green-600">欢迎拜访</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <span className="text-gray-500">仅标记位置</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">鼠标悬停查看简要信息</div>
      </div>

      {/* 重置视图按钮 */}
      <ResetViewButton onClick={handleResetView} />
      
      {/* 悬停时显示简要信息卡片 */}
      {hoveredSpot && (
        <HoverCard spot={hoveredSpot} />
      )}
    </div>
  )
}