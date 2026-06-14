// Nominatim API 地址解析服务
// 用于将地址转换为经纬度坐标

interface GeocodeResult {
  lat: number
  lng: number
  display_name: string
  place_id: number
}

class GeocodeService {
  private baseUrl = 'https://nominatim.openstreetmap.org/search'
  private cache = new Map<string, GeocodeResult>()

  // 地址解析
  async geocode(address: string): Promise<GeocodeResult | null> {
    // 优先从缓存获取
    const cacheKey = address.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`
      )

      if (!response.ok) {
        console.error('Geocode API error:', response.status)
        return null
      }

      const results = await response.json()
      if (!Array.isArray(results) || results.length === 0) {
        return null
      }

      const result = results[0]
      const geocodeResult: GeocodeResult = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        place_id: result.place_id,
      }

      // 缓存结果
      this.cache.set(cacheKey, geocodeResult)

      return geocodeResult
    } catch (error) {
      console.error('Geocode error:', error)
      return null
    }
  }

  // 根据国家和城市获取坐标
  async getLocation(country: string, city: string): Promise<{ lat: number; lng: number } | null> {
    // 先尝试精确匹配城市+国家
    const address = `${city}, ${country}`
    const result = await this.geocode(address)

    if (result) {
      return { lat: result.lat, lng: result.lng }
    }

    // 如果城市匹配失败，尝试只匹配国家
    const countryResult = await this.geocode(country)
    if (countryResult) {
      return { lat: countryResult.lat, lng: countryResult.lng }
    }

    return null
  }

  // 清除缓存
  clearCache() {
    this.cache.clear()
  }

  // 获取缓存大小
  getCacheSize() {
    return this.cache.size
  }
}

export const geocodeService = new GeocodeService()
