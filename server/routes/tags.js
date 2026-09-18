import { Router } from 'express'
import { storage } from '../utils/storage.js'

const router = Router()

// GET /api/tags —— 标签聚合（含每个标签的出现次数）
router.get('/', (req, res) => {
  const all = [...storage.readContent(), ...storage.readMusic()]
  const counts = {}
  for (const item of all) {
    for (const tag of item.tags || []) counts[tag] = (counts[tag] || 0) + 1
  }
  const list = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
  res.json({ list, total: list.length })
})

export default router
