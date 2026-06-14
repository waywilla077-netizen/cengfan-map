# 🌍 蹭饭地图 - 免费云部署指南

## 📋 前置准备

1. **GitHub 账户** - 免费注册：https://github.com/
2. **Render 账户** - 免费注册：https://render.com/
3. **Vercel 账户** - 免费注册：https://vercel.com/
4. **MongoDB Atlas 账户** - 免费注册：https://www.mongodb.com/atlas/database

---

## 🚀 步骤一：创建 GitHub 仓库

1. 访问 https://github.com/new 创建新仓库
2. 仓库名：`cengfan-map`（或其他名称）
3. 设置为 **Public**
4. 不初始化 README（我们已有代码）

## 🚀 步骤二：推送到 GitHub

```bash
cd "d:\0 文件暂存\蹭饭地图"
git remote add origin https://github.com/你的用户名/cengfan-map.git
git branch -M main
git push -u origin main
```

---

## 🚀 步骤三：部署后端到 Render

### 1. 创建 Web Service
1. 登录 Render → 点击 **New** → 选择 **Web Service**
2. 选择你的 GitHub 仓库
3. **Branch**: `main`

### 2. 配置构建
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm run preview`
- **Root Directory**: 留空

### 3. 设置环境变量
点击 **Advanced** → **Add Environment Variable**：

| 变量名 | 值 |
|--------|----|
| `PORT` | `10000` |
| `MONGODB_URI` | 从 MongoDB Atlas 获取 |
| `CORS_ORIGIN` | `*` |

### 4. 部署
点击 **Create Web Service**

### 5. 获取后端 URL
部署成功后会得到类似：`https://cengfan-backend-xxxxx.onrender.com`

---

## 🚀 步骤四：创建 MongoDB 数据库

### 1. 创建 Atlas 集群
1. 登录 MongoDB Atlas → 点击 **Build a Database**
2. 选择 **Free Tier (M0)**
3. 集群名称：`Cluster0`（默认）
4. 点击 **Create**

### 2. 配置网络访问
1. 进入集群 → 点击 **Network Access**
2. 点击 **Add IP Address**
3. 添加 `0.0.0.0/0`（允许所有 IP 访问）

### 3. 创建数据库用户
1. 点击 **Database Access**
2. 点击 **Add New Database User**
3. 用户名：`cengfan_user`
4. 密码：设置一个安全密码

### 4. 获取连接字符串
1. 进入集群 → 点击 **Connect**
2. 选择 **Connect your application**
3. 复制连接字符串，格式类似：
   ```
   mongodb+srv://cengfan_user:密码@cluster0.xxxx.mongodb.net/cengfan_map
   ```
4. 将此字符串粘贴到 Render 的 `MONGODB_URI` 环境变量

---

## 🚀 步骤五：部署前端到 Vercel

### 1. 创建 Project
1. 登录 Vercel → 点击 **New Project**
2. 选择你的 GitHub 仓库
3. 点击 **Import**

### 2. 配置
- **Root Directory**: `frontend`
- **Build Command**: 留空（Vercel 会自动检测）

### 3. 设置环境变量
点击 **Environment Variables** → **Add**:

| 变量名 | 值 |
|--------|----|
| `VITE_API_URL` | 你的 Render 后端 URL |

### 4. 部署
点击 **Deploy**

### 5. 获取前端 URL
部署成功后会得到类似：`https://cengfan-map.vercel.app`

---

## 🚀 步骤六：测试

1. 访问你的前端 URL
2. 点击 "添加点位" 创建测试点位
3. 打开另一个浏览器窗口，确认点位实时同步

---

## 🔧 常见问题

### 1. Render 后端启动失败
- **原因**：免费实例有休眠机制，首次访问可能需要等待
- **解决**：访问后端 URL 等待 30 秒

### 2. 跨域错误
- **确认**：Render 的 `CORS_ORIGIN` 设置为 `*`

### 3. Socket.io 连接失败
- **确认**：前端代理配置正确
- **确认**：后端 URL 在前端环境变量中正确设置

---

## 📁 项目结构

```
蹭饭地图/
├── frontend/          # React 前端
├── backend/           # Node.js 后端
├── DEPLOYMENT.md      # 部署指南
└── .gitignore         # Git 忽略配置
```

---

## 🎉 完成！

现在你已经拥有一个完整的全球蹭饭地图网站！

- 前端：https://你的域名.vercel.app
- 后端 API：https://你的后端.onrender.com/api
- Socket.io：实时通信已配置
