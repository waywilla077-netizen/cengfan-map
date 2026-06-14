import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { config } from './config/index.js'
import { connectDatabase } from './config/database.js'
import { setupSocket } from './socket/index.js'
import apiRoutes from './routes/api.js'

const app = express()
const httpServer = createServer(app)

// ========== 中间件 ==========

// CORS 配置
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// JSON 解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 请求日志中间件
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// ========== 路由 ==========

// 健康检查
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API 路由
app.use('/api', apiRoutes)

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ success: false, error: '接口不存在' })
})

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('全局错误:', err)
  res.status(500).json({ success: false, error: '服务器内部错误' })
})

// ========== Socket.io 配置 ==========

const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
})

// 初始化 Socket 服务
setupSocket(io)

// ========== 启动 ==========

async function start() {
  try {
    // 连接数据库
    await connectDatabase()

    // 启动服务器
    httpServer.listen(config.port, () => {
      console.log('='.repeat(50))
      console.log(`🚀 服务器运行在 http://localhost:${config.port}`)
      console.log(`📊 REST API: http://localhost:${config.port}/api`)
      console.log(`🔌 Socket.IO: ws://localhost:${config.port}`)
      console.log(`🌍 CORS Origin: ${config.corsOrigin}`)
      console.log('='.repeat(50))
    })
  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭...')
  httpServer.close(() => {
    console.log('HTTP 服务器已关闭')
    process.exit(0)
  })
})

start()

export { app, httpServer, io }
