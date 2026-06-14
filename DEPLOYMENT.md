# 🌍 蹭饭地图 - 部署教程

## 项目概述

这是一个全球实时蹭饭地图应用，支持用户添加蹭饭点位、实时查看和筛选点位。

**技术栈**
- 前端: React 18 + TypeScript + Vite + TailwindCSS + Leaflet
- 后端: Node.js + Express + Socket.io + MongoDB

---

## 部署方案

### 方案一：本地开发环境

#### 1. 启动 MongoDB

```bash
# 使用 Docker (推荐)
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# 或本地安装 MongoDB
```

#### 2. 启动后端

```bash
cd backend
npm install
npm run dev
```

#### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

---

### 方案二：免费云部署

#### 后端部署 (Render)

1. **创建 Render 账户**
   - 访问 https://render.com/ 注册账户

2. **创建 Web Service**
   - 连接 GitHub 仓库
   - 选择 `backend` 目录
   - 配置：
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run preview`
     - **Environment Variables**:
       ```
       PORT=10000
       MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cengfan_map
       CORS_ORIGIN=https://your-vercel-app.vercel.app
       ```

3. **获取后端 URL**
   - 部署成功后会得到类似 `https://cengfan-backend.onrender.com` 的 URL

#### 前端部署 (Vercel)

1. **创建 Vercel 账户**
   - 访问 https://vercel.com/ 注册账户

2. **创建 Project**
   - 连接 GitHub 仓库
   - 选择 `frontend` 目录

3. **配置环境变量**
   - 在 Vercel 项目设置中添加：
     ```
     VITE_API_URL=https://cengfan-backend.onrender.com
     ```

4. **更新 vite.config.ts**
   - 修改代理配置为后端 URL：
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: process.env.VITE_API_URL || 'http://localhost:4000',
         changeOrigin: true,
       },
       '/socket.io': {
         target: process.env.VITE_API_URL || 'http://localhost:4000',
         ws: true,
       },
     },
   },
   ```

5. **部署**
   - 点击 Deploy 按钮

#### MongoDB 数据库 (MongoDB Atlas)

1. **创建 Atlas 账户**
   - 访问 https://www.mongodb.com/atlas/database 注册账户

2. **创建免费集群**
   - 创建一个 M0 免费集群
   - 设置数据库用户和密码
   - 添加 IP 白名单（允许所有 IP 访问）

3. **获取连接字符串**
   - 连接字符串格式：
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/cengfan_map
     ```

---

## 环境变量配置

### 后端 `.env`

```env
# 服务端口
PORT=4000

# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/cengfan_map

# CORS 白名单
CORS_ORIGIN=http://localhost:3000
```

### 前端 (Vercel)

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 启动命令

| 环境 | 命令 | 说明 |
|------|------|------|
| 前端开发 | `npm run dev` | 开发模式 |
| 前端构建 | `npm run build` | 生产构建 |
| 后端开发 | `npm run dev` | 开发模式 |
| 后端构建 | `npm run build` | TypeScript 编译 |
| 后端启动 | `npm run preview` | 生产启动 |

---

## 项目结构

```
蹭饭地图/
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── components/          # UI 组件
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── services/            # API/Socket 服务
│   │   ├── types/               # TypeScript 类型
│   │   └── utils/               # 工具函数
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── backend/                     # Node.js 后端
    ├── src/
    │   ├── config/              # 配置文件
    │   ├── controllers/         # 控制器
    │   ├── middleware/          # 中间件
    │   ├── models/              # MongoDB 模型
    │   ├── routes/              # API 路由
    │   ├── services/            # 业务服务
    │   └── socket/              # Socket.io 处理
    ├── .env
    ├── package.json
    └── tsconfig.json
```

---

## 功能清单

- ✅ 全球 OSM 地图展示
- ✅ 移动端响应式适配
- ✅ 点位添加表单
- ✅ 点位筛选（国家/城市/状态）
- ✅ 实时在线人数统计
- ✅ Socket.io 实时通信
- ✅ MongoDB 数据持久化
- ✅ 地址解析服务
- ✅ 加载动画
- ✅ 断线重连提示

---

## 常见问题

### 1. Render 后端启动失败

**原因**: Render 免费实例有休眠机制，首次访问可能需要等待

**解决方案**: 使用 Always On 功能（需要付费）或使用其他服务

### 2. 跨域问题

**确保配置正确**:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}))
```

### 3. Socket.io 连接失败

**检查**:
- 确保后端 URL 正确
- 检查防火墙设置
- 使用正确的传输协议

---

## 许可证

MIT License
