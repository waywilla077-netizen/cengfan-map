import type { Spot } from '../types'

interface SpotDetailModalProps {
  spot: Spot
  onClose: () => void
}

export function SpotDetailModal({ spot, onClose }: SpotDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-green-100 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部图片 */}
        <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-500">
          {spot.imageUrl ? (
            <img
              src={spot.imageUrl}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            </div>
          )}
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* 状态标签 */}
          <div className="absolute bottom-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                spot.canCengFan
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {spot.canCengFan ? '欢迎拜访 🎉' : '仅标记位置'}
            </span>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-5">
          {/* 姓名 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>👋</span>
            {spot.name}
          </h2>

          {/* 详细信息 */}
          <div className="space-y-3">
            {/* 位置 */}
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
              <span className="text-xl">🌍</span>
              <div>
                <div className="text-xs text-gray-500">所在位置</div>
                <div className="font-medium text-gray-800">{spot.country} · {spot.city}</div>
              </div>
            </div>

            {/* 学校和专业 */}
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
              <span className="text-xl">🏫</span>
              <div>
                <div className="text-xs text-gray-500">学校/专业</div>
                <div className="font-medium text-gray-800">{spot.school}</div>
                {spot.major && <div className="text-sm text-green-600">{spot.major}</div>}
              </div>
            </div>

            {/* 拿手菜 */}
            {spot.signatureDish && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-xl">🍜</span>
                <div>
                  <div className="text-xs text-gray-500">拿手菜</div>
                  <div className="font-medium text-orange-600">{spot.signatureDish}</div>
                </div>
              </div>
            )}

            {/* 联系方式 */}
            {spot.contact && (
              <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl">
                <span className="text-xl">📱</span>
                <div>
                  <div className="text-xs text-gray-500">联系方式</div>
                  <div className="font-medium text-pink-600 break-all">{spot.contact}</div>
                </div>
              </div>
            )}

            {/* 留言 */}
            {spot.message && (
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <span className="text-xl">💬</span>
                <div>
                  <div className="text-xs text-gray-500">打招呼</div>
                  <div className="font-medium text-green-700 italic">{spot.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="mt-5 pt-4 border-t border-green-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl transition-all shadow-md"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
