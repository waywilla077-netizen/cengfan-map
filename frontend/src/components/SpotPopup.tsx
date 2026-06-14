import type { Spot } from '../types'

interface SpotPopupProps {
  spot: Spot
}

export function SpotPopup({ spot }: SpotPopupProps) {
  return (
    <div className="min-w-[200px] p-2 bg-gradient-to-br from-white to-green-50 rounded-xl">
      {/* 图片 */}
      {spot.imageUrl && (
        <div className="mb-2 rounded-lg overflow-hidden shadow-md">
          <img
            src={spot.imageUrl}
            alt={spot.name}
            className="w-full h-20 object-cover"
          />
        </div>
      )}

      {/* 头部 - 姓名和状态 */}
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-1">
          <span className="text-lg">👋</span>
          {spot.name}
        </h3>
        <span
          className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
            spot.canCengFan
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {spot.canCengFan ? '欢迎拜访 🎉' : '仅标记'}
        </span>
      </div>

      {/* 位置信息 */}
      <div className="space-y-1 text-xs">
        <div className="flex items-start gap-1.5">
          <span className="text-sm">🌍</span>
          <span className="text-gray-700 font-medium">
            {spot.country} · {spot.city}
          </span>
        </div>

        <div className="flex items-start gap-1.5">
          <span className="text-sm">🏫</span>
          <span className="text-gray-700">{spot.school}</span>
        </div>

        {/* 专业 */}
        {spot.major && (
          <div className="flex items-start gap-1.5">
            <span className="text-sm">📚</span>
            <span className="text-green-600 font-medium">{spot.major}</span>
          </div>
        )}

        {/* 拿手菜 */}
        {spot.signatureDish && (
          <div className="flex items-start gap-1.5">
            <span className="text-sm">🍜</span>
            <span className="text-orange-600 font-medium">{spot.signatureDish}</span>
          </div>
        )}

        {/* 联系方式 */}
        {spot.contact && (
          <div className="flex items-start gap-1.5">
            <span className="text-sm">📱</span>
            <span className="text-green-600 break-all font-medium">{spot.contact}</span>
          </div>
        )}

        {/* 打招呼/留言 */}
        {spot.message && (
          <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="flex items-start gap-1.5">
              <span className="text-sm">💬</span>
              <span className="text-green-700 text-xs italic">{spot.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部装饰 */}
      <div className="mt-2 pt-1.5 border-t border-green-100 flex justify-center gap-1">
        <span className="text-xs text-gray-400">点击查看详情</span>
      </div>
    </div>
  )
}