import type { Spot } from '../types'

interface SpotPopupProps {
  spot: Spot
}

export function SpotPopup({ spot }: SpotPopupProps) {
  return (
    <div className="min-w-[240px] p-2 bg-gradient-to-br from-white to-pink-50 rounded-xl">
      {/* 图片 */}
      {spot.imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden shadow-md">
          <img
            src={spot.imageUrl}
            alt={spot.name}
            className="w-full h-24 object-cover"
          />
        </div>
      )}
      
      {/* 头部 - 姓名和状态 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1">
          <span className="text-xl">👋</span>
          {spot.name}
        </h3>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            spot.canCengFan
              ? 'bg-gradient-to-r from-pink-200 to-purple-200 text-purple-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {spot.canCengFan ? '欢迎拜访 🎉' : '仅标记'}
        </span>
      </div>

      {/* 位置信息 */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-base">🌍</span>
          <span className="text-gray-700 font-medium">
            {spot.country} · {spot.city}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-base">🏫</span>
          <span className="text-gray-700">{spot.school}</span>
        </div>

        {/* 专业 */}
        {spot.major && (
          <div className="flex items-start gap-2">
            <span className="text-base">📚</span>
            <span className="text-indigo-600 font-medium">{spot.major}</span>
          </div>
        )}

        {/* 拿手菜 */}
        {spot.signatureDish && (
          <div className="flex items-start gap-2">
            <span className="text-base">🍜</span>
            <span className="text-orange-600 font-medium">{spot.signatureDish}</span>
          </div>
        )}

        {/* 联系方式 */}
        {spot.contact && (
          <div className="flex items-start gap-2">
            <span className="text-base">📱</span>
            <span className="text-pink-600 text-xs break-all font-medium">{spot.contact}</span>
          </div>
        )}
      </div>
      
      {/* 底部装饰 */}
      <div className="mt-3 pt-2 border-t border-pink-100 flex justify-center gap-1">
        <span className="text-xs text-gray-400">点击查看详情</span>
      </div>
    </div>
  )
}