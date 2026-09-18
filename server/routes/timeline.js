import { Router } from 'express'
import { allContent } from '../utils/mappers.js'

const router = Router()

// GET /api/timeline?year=2026 —— 按日期倒序分组的时间线数据
router.get('/', (req, res) => {
  const all = allContent()
  const { year } = req.query
  let filtered = year ? all.filter((i) => new Date(i.createdAt).getFullYear() === Number(year)) : all
  filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const groups = []
  const map = new Map()
  for (const item of filtered) {
    const d = new Date(item.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!map.has(key)) {
      const group = { date: key, items: [] }
      map.set(key, group)
      groups.push(group)
    }
    map.get(key).items.push(item)
  }
  const years = [...new Set(filtered.map((i) => new Date(i.createdAt).getFullYear()))].sort((a, b) => b - a)
  res.json({ groups, years, total: filtered.length })
})

export default router
