import { io, Socket } from 'socket.io-client'
import type { Spot } from '../types'

interface SocketResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

class SocketService {
  private socket: Socket | null = null
  private connectionPromise: Promise<Socket> | null = null

  connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return Promise.resolve(this.socket)
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io('/', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id)
        resolve(this.socket!)
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
      })
    })

    return this.connectionPromise
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connectionPromise = null
    }
  }

  getSocket() {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  // ========== 点位操作 ==========

  // 获取所有点位
  async getAllSpots(): Promise<Spot[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      this.socket.emit('spots:getAll', (response: SocketResponse<Spot[]>) => {
        if (response.success && response.data) {
          resolve(response.data)
        } else {
          reject(new Error(response.error || '获取点位失败'))
        }
      })
    })
  }

  // 添加点位
  async addSpot(spot: Omit<Spot, 'id' | 'createdAt'>): Promise<Spot> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      this.socket.emit('spot:add', spot, (response: SocketResponse<Spot>) => {
        if (response.success && response.data) {
          resolve(response.data)
        } else {
          reject(new Error(response.error || '添加点位失败'))
        }
      })
    })
  }

  // 更新点位
  async updateSpot(id: string, data: Partial<Spot>): Promise<Spot> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      this.socket.emit('spot:update', { id, ...data }, (response: SocketResponse<Spot>) => {
        if (response.success && response.data) {
          resolve(response.data)
        } else {
          reject(new Error(response.error || '更新点位失败'))
        }
      })
    })
  }

  // 删除点位
  async removeSpot(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      this.socket.emit('spot:remove', id, (response: SocketResponse) => {
        if (response.success) {
          resolve()
        } else {
          reject(new Error(response.error || '删除点位失败'))
        }
      })
    })
  }

  // ========== 事件监听 ==========

  // 监听新点位添加
  onSpotAdded(callback: (spot: Spot) => void) {
    this.socket?.on('spot:added', callback)
    return () => this.socket?.off('spot:added', callback)
  }

  // 监听点位更新
  onSpotUpdated(callback: (spot: Spot) => void) {
    this.socket?.on('spot:updated', callback)
    return () => this.socket?.off('spot:updated', callback)
  }

  // 监听点位删除
  onSpotRemoved(callback: (id: string) => void) {
    this.socket?.on('spot:removed', callback)
    return () => this.socket?.off('spot:removed', callback)
  }

  // 监听在线人数
  onOnlineCount(callback: (data: { count: number; timestamp: number }) => void) {
    this.socket?.on('online:count', callback)
    return () => this.socket?.off('online:count', callback)
  }
}

export const socketService = new SocketService()
