// 必须放在所有 import 之前：先加载 server/.env，后面的模块才能读到 ADMIN_* 等配置
import './utils/env.js'

import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import contentRouter from './routes/content.js'
import musicRouter from './routes/music.js'
import wallpaperRouter from './routes/wallpapers.js'
import tagsRouter from './routes/tags.js'
import timelineRouter from './routes/timeline.js'
import uploadRouter from './routes/upload.js'
import docsRouter from './routes/docs.js'
import tagCategoryRouter from './routes/tagCategories.js'
import settingsRouter from './routes/settings.js'
import authRouter from './routes/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3000

// ── 中间件 ──
app.use(cors()) // 跨域
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// 上传图片的静态资源
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── 路由 ──
app.use('/api/content', contentRouter)
app.use('/api/music', musicRouter)
app.use('/api/wallpapers', wallpaperRouter)
app.use('/api/tags', tagsRouter)
app.use('/api/timeline', timelineRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/docs', docsRouter)
app.use('/api/tag-categories', tagCategoryRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/auth', authRouter)

// 根路径
app.get('/', (req, res) => {
  res.json({ name: '世界线存档 API', docs: '/api/docs', health: 'ok' })
})

// 404 兜底
app.use((req, res) => {
  res.status(404).json({ message: `未找到路由: ${req.method} ${req.originalUrl}` })
})

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('[error]', err)
  // multer 等上传错误归为 400
  const status = err.status || (err.name === 'MulterError' ? 400 : 500)
  let message = err.message || '服务器内部错误'
  if (err.code === 'LIMIT_FILE_SIZE') message = '文件过大，请压缩后再上传'
  res.status(status).json({ message })
})

const server = app.listen(PORT, () => {
  console.log(`\n  世界线存档 API 已启动: http://localhost:${PORT}`)
  console.log(`  接口文档:            http://localhost:${PORT}/api/docs\n`)
})

// 端口被占用时给出可操作的提示，而不是抛一长串 stack（常见于上一次的后端进程没退干净）
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  [启动失败] 端口 ${PORT} 已被占用，通常是有另一个后端进程还在运行。`)
    console.error(`  查看占用者：  netstat -ano | findstr :${PORT}`)
    console.error('  结束进程：    taskkill /F /PID <上面最后一列的 PID>')
    console.error('  （Git Bash 中 taskkill 要写成 taskkill //F //PID <pid>）\n')
    process.exit(1)
  }
  throw err
})
