import { useState, useEffect, useRef } from 'react'
import type { SpotFormData, Spot } from '../types'
import { geocodeService } from '../services/geocode'

interface AddSpotModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (spot: Spot) => void
}

const initialFormData: SpotFormData = {
  name: '',
  country: '',
  city: '',
  school: '',
  major: '',
  canCengFan: true,
  signatureDish: '',
  contact: '',
  imageUrl: '',
  message: '',
}

export function AddSpotModal({ isOpen, onClose, onSubmit }: AddSpotModalProps) {
  const [formData, setFormData] = useState<SpotFormData>(initialFormData)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // ESC 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // 获取当前位置（GPS）
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('浏览器不支持定位功能')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGeocodeError('')
        setIsLocating(false)
      },
      (error) => {
        console.error('定位失败:', error)
        setGeocodeError('GPS定位失败，请尝试地址解析')
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // 通过地址解析获取坐标
  const geocodeAddress = async () => {
    if (!formData.country || !formData.city) {
      setGeocodeError('请先填写国家和城市')
      return
    }

    setIsGeocoding(true)
    setGeocodeError('')

    try {
      const result = await geocodeService.getLocation(formData.country, formData.city)
      
      if (result) {
        setLocation(result)
      } else {
        setGeocodeError('地址解析失败，请尝试其他地址')
      }
    } catch (error) {
      console.error('地址解析错误:', error)
      setGeocodeError('地址解析失败，请稍后重试')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 图片压缩处理
  const compressImage = (file: File, maxWidth: number = 400, maxHeight: number = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        // 计算缩放比例
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // 创建canvas压缩
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        
        // 使用中等质量压缩
        const compressed = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressed)
      }

      img.onerror = () => reject(new Error('图片加载失败'))
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  }

  // 图片上传处理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
      }

      // 验证文件大小（最大 2MB，优化存储）
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB，请压缩图片后上传')
        return
      }

      try {
        // 压缩图片
        const compressedBase64 = await compressImage(file)
        setImagePreview(compressedBase64)
        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }))
      } catch (error) {
        console.error('图片压缩失败:', error)
        alert('图片处理失败，请重试')
      }
    }
  }

  // 清除图片
  const handleClearImage = () => {
    setImagePreview('')
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!location) {
      alert('请先获取您的位置信息')
      return
    }

    if (!formData.name || !formData.country || !formData.city || !formData.school) {
      alert('请填写完整信息（姓名、国家、城市、学校为必填项）')
      return
    }

    const spot: Spot = {
      id: Date.now().toString(),
      ...formData,
      location,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onSubmit(spot)
    setFormData(initialFormData)
    setLocation(null)
    setImagePreview('')
    setGeocodeError('')
    onClose()
  }

  // 重置表单
  const resetForm = () => {
    setFormData(initialFormData)
    setLocation(null)
    setImagePreview('')
    setGeocodeError('')
  }

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-green-100"
      >
        {/* 头部 - 绿色渐变 */}
        <div className="sticky top-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">📍</span>
            添加我的位置
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="请输入您的姓名"
              className="w-full px-4 py-2.5 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all bg-pink-50/30"
              required
            />
          </div>

          {/* 国家 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              国家 <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="如：中国、美国、日本"
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none transition-all bg-purple-50/30"
              required
            />
          </div>

          {/* 城市 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              城市 <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="请输入城市名称"
              className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition-all bg-indigo-50/30"
              required
            />
          </div>

          {/* 学校 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              学校/单位 <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="请输入学校或单位名称"
              className="w-full px-4 py-2.5 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all bg-pink-50/30"
              required
            />
          </div>

          {/* 专业 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              专业
            </label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="如：计算机科学、金融学"
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none transition-all bg-purple-50/30"
            />
          </div>

          {/* 是否欢迎拜访 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              是否欢迎同学拜访
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border-2 border-pink-300 bg-pink-50 hover:bg-pink-100 transition-all">
                <input
                  type="radio"
                  name="canCengFan"
                  value="true"
                  checked={formData.canCengFan === true}
                  onChange={() => setFormData((prev) => ({ ...prev, canCengFan: true }))}
                  className="w-4 h-4 text-pink-500"
                />
                <span className="text-pink-600 font-medium">欢迎拜访 🎉</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all">
                <input
                  type="radio"
                  name="canCengFan"
                  value="false"
                  checked={formData.canCengFan === false}
                  onChange={() => setFormData((prev) => ({ ...prev, canCengFan: false }))}
                  className="w-4 h-4 text-gray-400"
                />
                <span className="text-gray-500 font-medium">仅标记位置</span>
              </label>
            </div>
          </div>

          {/* 拿手菜/特色 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              拿手菜/特色
            </label>
            <input
              type="text"
              name="signatureDish"
              value={formData.signatureDish}
              onChange={handleChange}
              placeholder="如：红烧肉、糖醋排骨、火锅"
              className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition-all bg-indigo-50/30"
            />
          </div>

          {/* 联系方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              联系方式
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="微信号/QQ/邮箱/电话"
              className="w-full px-4 py-2.5 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-300 outline-none transition-all bg-green-50/30"
            />
          </div>

          {/* 打招呼/留言 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              打招呼/简短留言 <span className="text-gray-400">(最多50字)</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="如：欢迎来找我玩！毕业快乐！"
              rows={2}
              maxLength={50}
              className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none transition-all bg-emerald-50/30 resize-none"
            />
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              个人图片
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="预览"
                  className="w-full h-32 object-cover rounded-xl border-2 border-pink-200"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-green-200 rounded-xl p-4 text-center bg-green-50/30 hover:bg-green-50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-green-600">点击上传图片</span>
                  <span className="text-xs text-gray-400">支持 JPG、PNG，最大 2MB（自动压缩）</span>
                </label>
              </div>
            )}
          </div>

          {/* 位置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              位置 <span className="text-pink-500">*</span>
            </label>
            
            {/* 位置输入框 */}
            <input
              type="text"
              value={location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : ''}
              readOnly
              placeholder="点击下方按钮获取位置"
              className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl bg-indigo-50/50 text-indigo-600 mb-2"
            />

            {/* 错误提示 */}
            {geocodeError && (
              <p className="text-sm text-red-500 mb-2">{geocodeError}</p>
            )}

            {/* 获取位置按钮组 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLocating || isGeocoding}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-200 disabled:to-cyan-200 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-md"
              >
                {isLocating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>定位中</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>GPS定位</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={isGeocoding || isLocating || !formData.country || !formData.city}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:from-purple-200 disabled:to-pink-200 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-md"
              >
                {isGeocoding ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>解析中</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>地址解析</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              GPS定位需要开启定位权限；地址解析使用国家和城市名称自动匹配坐标
            </p>
          </div>

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-white font-medium rounded-xl hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              ✨ 提交点位
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}