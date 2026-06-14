// 预留：位置 Schema
import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: true })

export const LocationModel = mongoose.model('Location', locationSchema)
