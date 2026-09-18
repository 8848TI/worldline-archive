import { Router } from 'express'
import { storage } from '../utils/storage.js'

const router = Router()

// GET /api/music —— 音乐列表
router.get('/', (req, res) => {
  let list = storage.readMusic()
  const { keyword } = req.query
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter((m) => `${m.title}${m.artist}${m.album || ''}`.toLowerCase().includes(kw))
  }
  res.json({ list, total: list.length })
})

// GET /api/music/:id —— 单曲详情
router.get('/:id', (req, res) => {
  const item = storage.readMusic().find((m) => m.id === req.params.id)
  if (!item) return res.status(404).json({ message: '曲目不存在' })
  res.json(item)
})

export default router
