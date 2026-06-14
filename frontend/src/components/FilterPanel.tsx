import { useState, useMemo } from 'react'
import type { Spot } from '../types'

interface FilterProps {
  spots: Spot[]
  onFilter: (filteredSpots: Spot[]) => void
}

export function FilterPanel({ spots, onFilter }: FilterProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // 获取所有国家列表
  const countries = useMemo(() => {
    const unique = new Set(spots.map((s) => s.country))
    return Array.from(unique).sort()
  }, [spots])

  // 根据国家获取城市列表
  const cities = useMemo(() => {
    if (!selectedCountry) return []
    const filtered = spots.filter((s) => s.country === selectedCountry)
    const unique = new Set(filtered.map((s) => s.city))
    return Array.from(unique).sort()
  }, [spots, selectedCountry])

  // 应用筛选
  const applyFilter = () => {
    let result = spots

    if (selectedCountry) {
      result = result.filter((s) => s.country === selectedCountry)
    }

    if (selectedCity) {
      result = result.filter((s) => s.city === selectedCity)
    }

    if (selectedStatus !== 'all') {
      result = result.filter((s) => s.canCengFan === (selectedStatus === 'available'))
    }

    onFilter(result)
  }

  // 重置筛选
  const resetFilter = () => {
    setSelectedCountry('')
    setSelectedCity('')
    setSelectedStatus('all')
    onFilter(spots)
  }

  const hasFilters = selectedCountry || selectedCity || selectedStatus !== 'all'

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM9 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM9 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
          </svg>
          筛选点位
        </h3>
        {hasFilters && (
          <button
            onClick={resetFilter}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            重置
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* 国家筛选 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">国家</label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value)
              setSelectedCity('')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
          >
            <option value="">全部国家</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* 城市筛选 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">城市</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedCountry}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm disabled:bg-gray-100"
          >
            <option value="">全部城市</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* 状态筛选 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">状态</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
          >
            <option value="all">全部状态</option>
            <option value="available">可蹭饭</option>
            <option value="unavailable">不可蹭饭</option>
          </select>
        </div>

        {/* 应用按钮 */}
        <button
          onClick={applyFilter}
          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm"
        >
          应用筛选
        </button>
      </div>
    </div>
  )
}
