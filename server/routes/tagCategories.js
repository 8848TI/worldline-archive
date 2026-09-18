import { Router } from 'express'
import { storage } from '../utils/storage.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

// GET /api/tag-categories —— 两级标签体系（大类 + 子小类）
router.get('/', (req, res) => {
  res.json({ list: storage.readTagCategories() })
})

// POST /api/tag-categories —— 新增大类或子小类
// body: { name: '新大类' }  或  { parent: '动漫', name: '新子类' }
router.post('/', requireAuth, (req, res) => {
  const { parent = '', name } = req.body || {}
  const n = String(name || '').trim()
  if (!n) return res.status(400).json({ message: '名称不能为空' })

  const list = storage.readTagCategories()

  if (!parent) {
    if (!list.some((c) => c.name === n)) list.push({ name: n, children: [] })
  } else {
    const cat = list.find((c) => c.name === parent)
    if (!cat) return res.status(404).json({ message: '大类不存在' })
    if (!Array.isArray(cat.children)) cat.children = []
    if (!cat.children.includes(n)) cat.children.push(n)
  }

  storage.writeTagCategories(list)
  res.json({ list })
})

// DELETE /api/tag-categories?name=xxx           删除大类
// DELETE /api/tag-categories?parent=xxx&name=yyy 删除子小类
router.delete('/', requireAuth, (req, res) => {
  const parent = String(req.query.parent || '')
  const name = String(req.query.name || '').trim()
  if (!name) return res.status(400).json({ message: '名称不能为空' })

  let list = storage.readTagCategories()

  if (!parent) {
    list = list.filter((c) => c.name !== name)
  } else {
    const cat = list.find((c) => c.name === parent)
    if (!cat) return res.status(404).json({ message: '大类不存在' })
    if (Array.isArray(cat.children)) cat.children = cat.children.filter((x) => x !== name)
  }

  storage.writeTagCategories(list)
  res.json({ list })
})

export default router
