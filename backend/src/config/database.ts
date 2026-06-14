import mongoose from 'mongoose'
import { config } from './index.js'

let isConnected = false

export async function connectDatabase() {
  // 防止重复连接
  if (isConnected) {
    console.log('MongoDB 已连接，跳过')
    return
  }

  try {
    console.log(`正在连接 MongoDB: ${config.mongodbUri}`)
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })

    isConnected = true
    console.log('✅ MongoDB 连接成功')

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 连接错误:', err)
      isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 连接断开，正在重连...')
      isConnected = false
    })

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB 重连成功')
      isConnected = true
    })

  } catch (error) {
    console.error('MongoDB 连接失败:', error)
    throw error
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
