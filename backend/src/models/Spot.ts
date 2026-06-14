import mongoose from 'mongoose'

// 蹭饭点位 Schema
const spotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  school: { type: String, required: true },
  canCengFan: { type: Boolean, default: true },
  signatureDish: { type: String, default: '' },
  contact: { type: String, default: '' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
})

// 索引优化查询性能
spotSchema.index({ 'location.lat': 1, 'location.lng': 1 })
spotSchema.index({ canCengFan: 1 })

export const SpotModel = mongoose.model('Spot', spotSchema)
