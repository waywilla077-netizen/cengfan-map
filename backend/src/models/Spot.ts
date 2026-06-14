import mongoose from 'mongoose'

// 蹭饭点位 Schema - 毕业班同学地图
const spotSchema = new mongoose.Schema({
  name: { type: String, required: true },           // 姓名
  country: { type: String, required: true },        // 国家
  city: { type: String, required: true },           // 城市
  school: { type: String, required: true },         // 大学/学校
  major: { type: String, default: '' },             // 专业
  canCengFan: { type: Boolean, default: true },     // 是否欢迎拜访
  signatureDish: { type: String, default: '' },     // 拿手菜/特色
  contact: { type: String, default: '' },           // 联系方式（微信/QQ/邮箱）
  imageUrl: { type: String, default: '' },          // 个人图片URL
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// 索引优化查询性能
spotSchema.index({ 'location.lat': 1, 'location.lng': 1 })
spotSchema.index({ canCengFan: 1 })
spotSchema.index({ createdAt: -1 })

export const SpotModel = mongoose.model('Spot', spotSchema)
