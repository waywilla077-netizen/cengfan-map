import { useState, useEffect, useCallback } from 'react'
import { MapContainer } from './components/MapContainer'
import { AddSpotModal } from './components/AddSpotModal'
import { FilterPanel } from './components/FilterPanel'
import { SpotDetailModal } from './components/SpotDetailModal'
import { LoadingSpinner, ReconnectAlert, Toast } from './components/UI'
import { useSpots } from './hooks/useSpots'
import { socketService } from './services/socket'
import type { Spot } from './types'

function App() {
  const { spots, loading, onlineCount, useMockData, addSpot, removeSpot } = useSpots()
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [detailSpot, setDetailSpot] = useState<Spot | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // 初始加载所有点位
  useEffect(() => {
    setFilteredSpots(spots)
  }, [spots])

  // 监听Socket连接状态
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true)
      showToast('连接成功', 'success')
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const socket = socketService.getSocket()
    if (socket) {
      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)

      return () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
      }
    }
  }, [])

  // 显示Toast提示
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 添加点位处理
  const handleAddSpot = async (spot: Spot) => {
    setIsSubmitting(true)
    try {
      await addSpot(spot)
      showToast('点位添加成功', 'success')
    } catch (error) {
      console.error('添加失败:', error)
      showToast('添加点位失败，请重试', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除点位
  const handleDeleteSpot = async (spot: Spot) => {
    if (!window.confirm(`确定要删除 ${spot.name} 的点位吗？此操作不可撤销。`)) {
      return
    }
    try {
      await removeSpot(spot.id)
      setDetailSpot(null)
      showToast('点位删除成功', 'success')
    } catch (error) {
      console.error('删除失败:', error)
      showToast('删除点位失败，请重试', 'error')
    }
  }

  // 筛选处理
  const handleFilter = (filtered: Spot[]) => {
    setFilteredSpots(filtered)
    setIsFilterOpen(false)
    showToast(`筛选完成，共 ${filtered.length} 个点位`, 'info')
  }

  // 重新连接
  const handleReconnect = useCallback(async () => {
    try {
      await socketService.connect()
      showToast('重新连接成功', 'success')
    } catch (error) {
      showToast('连接失败，请稍后重试', 'error')
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      {/* 加载动画 */}
      {loading && <LoadingSpinner />}

      {/* 地图 */}
      <MapContainer
        spots={filteredSpots}
        selectedSpot={selectedSpot}
        onSelectSpot={setSelectedSpot}
        onViewDetail={setDetailSpot}
      />

      {/* 顶部标题栏 - 高级感深绿色风格 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] px-6 py-3 bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-900 rounded-2xl shadow-xl border border-emerald-700/50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-amber-100 flex items-center gap-2">
              <span className="text-2xl animate-float">🍚</span>
              食工实验221班蹭饭地图
            </h1>
            <div className="flex items-center gap-3 text-xs text-amber-200/80 mt-1">
              {loading ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  加载中...
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <span className="text-base">📍</span>
                    全球 {filteredSpots.length} 位同学
                  </span>
                  {!useMockData && onlineCount > 0 && (
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {onlineCount} 人在线
                    </span>
                  )}
                  {useMockData && (
                    <span className="text-yellow-200 text-xs bg-yellow-400/20 px-2 py-0.5 rounded-full">
                      演示模式
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 筛选按钮 */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-800/50 hover:bg-emerald-700/60 text-amber-100 font-medium rounded-xl transition-all border border-emerald-600/30 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM9 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM9 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
              </svg>
              <span className="hidden sm:inline">筛选</span>
            </button>
            {/* 添加点位按钮 - 深绿色高级感风格 */}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-800 to-green-800 hover:from-emerald-700 hover:to-green-700 disabled:from-emerald-900 disabled:to-green-900 text-amber-100 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:transform-none border border-emerald-600/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">
                {isSubmitting ? '添加中...' : '添加我的位置'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      {isFilterOpen && (
        <div className="absolute top-20 left-4 right-4 z-[900]">
          <div className="max-w-sm mx-auto">
            <FilterPanel spots={spots} onFilter={handleFilter} />
          </div>
        </div>
      )}

      {/* 添加点位弹窗 */}
      <AddSpotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSpot}
      />

      {/* 详情弹窗 */}
      {detailSpot && (
        <SpotDetailModal
          spot={detailSpot}
          onClose={() => setDetailSpot(null)}
          onDelete={() => handleDeleteSpot(detailSpot)}
        />
      )}

      {/* 断线重连提示 */}
      <ReconnectAlert isConnected={isConnected} onReconnect={handleReconnect} />

      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
