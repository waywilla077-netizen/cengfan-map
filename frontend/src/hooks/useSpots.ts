import { useState, useEffect, useCallback } from 'react'
import type { Spot } from '../types'
import { socketService } from '../services/socket'

// 模拟数据（无后端时使用）
const mockSpots: Spot[] = [
  {
    id: '1',
    name: '张三',
    country: '中国',
    city: '北京',
    school: '清华大学',
    major: '计算机科学与技术',
    canCengFan: true,
    signatureDish: '红烧肉',
    contact: '微信号: zhangsan123',
    imageUrl: '',
    location: { lat: 39.9042, lng: 116.4074 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: '李四',
    country: '中国',
    city: '上海',
    school: '复旦大学',
    major: '金融学',
    canCengFan: false,
    signatureDish: '糖醋小排',
    contact: '邮箱: lisi@email.com',
    imageUrl: '',
    location: { lat: 31.2304, lng: 121.4737 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: '王五',
    country: '美国',
    city: '纽约',
    school: '哥伦比亚大学',
    major: '数据科学',
    canCengFan: true,
    signatureDish: '汉堡薯条',
    contact: '电话: +1-555-1234',
    imageUrl: '',
    location: { lat: 40.7128, lng: -74.006 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [onlineCount, setOnlineCount] = useState(0)
  const [useMockData, setUseMockData] = useState(false)

  // 加载点位
  const loadSpots = useCallback(async () => {
    try {
      // 尝试连接 Socket 并获取数据
      await socketService.connect()
      const data = await socketService.getAllSpots()
      setSpots(data)
      setUseMockData(false)
    } catch {
      // 连接失败，使用模拟数据
      console.log('使用模拟数据')
      setSpots(mockSpots)
      setUseMockData(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // 添加点位
  const addSpot = useCallback(async (spot: Spot) => {
    if (useMockData) {
      // 模拟模式：直接添加到本地
      setSpots((prev) => [...prev, { ...spot, id: Date.now().toString(), updatedAt: new Date() }])
      return
    }

    try {
      await socketService.addSpot({
        name: spot.name,
        country: spot.country,
        city: spot.city,
        school: spot.school,
        major: spot.major,
        canCengFan: spot.canCengFan,
        signatureDish: spot.signatureDish,
        contact: spot.contact,
        imageUrl: spot.imageUrl,
        location: spot.location,
      })
      // 服务器会通过 socket 广播，不需要手动更新
    } catch (error) {
      console.error('添加点位失败:', error)
      throw error
    }
  }, [useMockData])

  // 删除点位
  const removeSpot = useCallback(async (id: string) => {
    if (useMockData) {
      setSpots((prev) => prev.filter((s) => s.id !== id))
      return
    }

    try {
      await socketService.removeSpot(id)
    } catch (error) {
      console.error('删除点位失败:', error)
      throw error
    }
  }, [useMockData])

  // 初始化
  useEffect(() => {
    loadSpots()
  }, [loadSpots])

  // 监听 Socket 事件（非模拟模式）
  useEffect(() => {
    if (useMockData) return

    const unsubAdded = socketService.onSpotAdded((spot) => {
      setSpots((prev) => {
        // 防止重复
        if (prev.some((s) => s.id === spot.id)) return prev
        return [...prev, spot]
      })
    })

    const unsubUpdated = socketService.onSpotUpdated((updatedSpot) => {
      setSpots((prev) =>
        prev.map((s) => (s.id === updatedSpot.id ? updatedSpot : s))
      )
    })

    const unsubRemoved = socketService.onSpotRemoved((id) => {
      setSpots((prev) => prev.filter((s) => s.id !== id))
    })

    const unsubOnlineCount = socketService.onOnlineCount(({ count }) => {
      setOnlineCount(count)
    })

    return () => {
      unsubAdded()
      unsubUpdated()
      unsubRemoved()
      unsubOnlineCount()
    }
  }, [useMockData])

  return {
    spots,
    loading,
    onlineCount,
    useMockData,
    addSpot,
    removeSpot,
  }
}
