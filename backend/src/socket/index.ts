import { Server, Socket } from 'socket.io'
import { SpotModel } from '../models/Spot.js'

// 在线用户统计
const onlineUsers = new Map<string, { socketId: string; connectedAt: Date }>()

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`客户端连接: ${socket.id}`)

    // 添加到在线用户
    onlineUsers.set(socket.id, {
      socketId: socket.id,
      connectedAt: new Date(),
    })

    // 广播在线人数
    broadcastOnlineCount(io)

    // ========== 事件处理 ==========

    // 1. 获取所有点位
    socket.on('spots:getAll', async (callback) => {
      try {
        const spots = await SpotModel.find().sort({ createdAt: -1 }).lean()
        // 转换 _id 为 id
        const formattedSpots = spots.map((spot) => ({
          ...spot,
          id: spot._id.toString(),
        }))
        callback?.({ success: true, data: formattedSpots })
      } catch (error) {
        console.error('获取点位失败:', error)
        callback?.({ success: false, error: '获取点位失败' })
      }
    })

    // 2. 添加新点位
    socket.on('spot:add', async (data, callback) => {
      try {
        const spot = new SpotModel(data)
        const savedSpot = await spot.save()
        const formattedSpot = {
          ...savedSpot.toObject(),
          id: savedSpot._id.toString(),
        }

        // 广播给所有客户端（包括发送者）
        io.emit('spot:added', formattedSpot)
        callback?.({ success: true, data: formattedSpot })

        console.log(`新点位添加: ${savedSpot.name} (${savedSpot.city})`)
      } catch (error) {
        console.error('添加点位失败:', error)
        callback?.({ success: false, error: '添加点位失败' })
      }
    })

    // 3. 更新点位
    socket.on('spot:update', async (data, callback) => {
      try {
        const { id, ...updateData } = data
        const spot = await SpotModel.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        ).lean()

        if (!spot) {
          callback?.({ success: false, error: '点位不存在' })
          return
        }

        const formattedSpot = {
          ...spot,
          id: spot._id.toString(),
        }

        // 广播给所有客户端
        io.emit('spot:updated', formattedSpot)
        callback?.({ success: true, data: formattedSpot })

        console.log(`点位更新: ${spot.name}`)
      } catch (error) {
        console.error('更新点位失败:', error)
        callback?.({ success: false, error: '更新点位失败' })
      }
    })

    // 4. 删除点位
    socket.on('spot:remove', async (id, callback) => {
      try {
        const spot = await SpotModel.findByIdAndDelete(id)

        if (!spot) {
          callback?.({ success: false, error: '点位不存在' })
          return
        }

        // 广播给所有客户端
        io.emit('spot:removed', id)
        callback?.({ success: true })

        console.log(`点位删除: ${spot.name}`)
      } catch (error) {
        console.error('删除点位失败:', error)
        callback?.({ success: false, error: '删除点位失败' })
      }
    })

    // ========== 断开连接 ==========
    socket.on('disconnect', () => {
      console.log(`客户端断开: ${socket.id}`)
      onlineUsers.delete(socket.id)
      broadcastOnlineCount(io)
    })

    // ========== 错误处理 ==========
    socket.on('error', (error) => {
      console.error(`Socket 错误 (${socket.id}):`, error)
    })
  })

  // 定期清理无效连接
  setInterval(() => {
    let cleaned = 0
    const validSockets = new Set(io.sockets.sockets.keys())

    for (const [socketId] of onlineUsers) {
      if (!validSockets.has(socketId)) {
        onlineUsers.delete(socketId)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`清理了 ${cleaned} 个无效连接`)
      broadcastOnlineCount(io)
    }
  }, 30000)
}

// 广播在线人数
function broadcastOnlineCount(io: Server) {
  io.emit('online:count', {
    count: onlineUsers.size,
    timestamp: Date.now(),
  })
}
