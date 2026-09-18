import { Router } from 'express'
import { storage } from '../utils/storage.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

// GET /api/settings —— 站点设置（首页横幅视频等）
router.get('/', (req, res) => {
  res.json(storage.readSettings())
})

// PUT /api/settings —— 更新站点设置（需登录；浅合并，只传要改的字段即可）
router.put('/', requireAuth, (req, res) => {
  const current = storage.readSettings()
  const next = { ...current, ...(req.body || {}) }
  storage.writeSettings(next)
  res.json(next)
})

export default router
