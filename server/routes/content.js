import { Router } from 'express'
import { storage } from '../utils/storage.js'
import { allContent } from '../utils/mappers.js'
import { collectUploadFiles, deleteUploadFiles } from '../utils/uploadFiles.js'
import { validateContent } from '../utils/validate.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

// 通用筛选 / 排序 / 分页
function applyQuery(list, query) {
  let result = [...list]
  const { type, tag, keyword, sort } = query
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize, 10) || 12))

  if (type) result = result.filter((i) => i.type === type)
  if (tag) result = result.filter((i) => (i.tags || []).includes(tag))
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    // 除标题/简介外，正文（ext.article.content）与音乐作者也参与匹配，
    // 这样站内搜索能搜到文章内容，而不只是标题。
    const textOf = (i) => `${i.title}${i.summary}${i.ext?.article?.content || ''}${i.ext?.music?.artist || ''}${i.ext?.music?.album || ''}`
    result = result.filter((i) => textOf(i).toLowerCase().includes(kw))
  }
  if (sort === 'rating') result.sort((a, b) => (b.ext?.media?.rating || 0) - (a.ext?.media?.rating || 0))
  else if (sort === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = result.length
  const start = (page - 1) * pageSize
  return { list: result.slice(start, start + pageSize), total, page, pageSize }
}

// ── 新增 ──
// type=music 存 musics 表，其余类型存 contents 表
function createItem(body) {
  const now = new Date().toISOString()
  const type = body.type || 'essay'
  const id = body.id || `${type}-${Date.now().toString(36)}`

  if (type === 'music') {
    const m = body.ext?.music || {}
    return storage.insertMusic({
      id,
      title: body.title,
      artist: m.artist || '',
      album: m.album || '',
      cover: body.cover || '',
      audioUrl: m.audioUrl || '',
      duration: m.duration || 0,
      tags: body.tags || [],
      createdAt: now
    })
  }

  return storage.insertContent({
    id,
    type,
    title: body.title,
    summary: body.summary || '',
    cover: body.cover || '',
    tags: body.tags || [],
    createdAt: now,
    updatedAt: now,
    ext: body.ext || {}
  })
}

// ── 修改 ──
function updateItem(id, body) {
  const now = new Date().toISOString()

  const track = storage.findMusic(id)
  if (track) {
    const m = body.ext?.music || {}
    return storage.updateMusic(id, {
      title: body.title ?? track.title,
      artist: m.artist ?? track.artist,
      album: m.album ?? track.album,
      cover: body.cover ?? track.cover,
      audioUrl: m.audioUrl ?? track.audioUrl,
      duration: m.duration ?? track.duration,
      tags: body.tags ?? track.tags
    })
  }

  const item = storage.findContent(id)
  if (!item) return null
  return storage.updateContent(id, {
    title: body.title ?? item.title,
    summary: body.summary ?? item.summary,
    cover: body.cover ?? item.cover,
    tags: body.tags ?? item.tags,
    ext: body.ext ?? item.ext,
    updatedAt: now
  })
}

// ── 删除 ──
// 除了移除记录，还会清理「只被这条内容引用过」的上传文件，避免 uploads/ 里堆积孤儿文件
function removeItem(id) {
  const track = storage.findMusic(id)
  if (track) {
    storage.deleteMusic(id)
    // 注意：在删除之后再读剩余数据，否则自己还会被算作「仍在使用」
    deleteUploadFiles(collectUploadFiles(track), [storage.readMusic(), storage.readContent(), storage.readSettings()])
    return true
  }

  const item = storage.findContent(id)
  if (!item) return false
  storage.deleteContent(id)
  deleteUploadFiles(collectUploadFiles(item), [storage.readContent(), storage.readMusic(), storage.readSettings()])
  return true
}

// GET /api/content —— 统一内容列表
router.get('/', (req, res) => {
  res.json(applyQuery(allContent(), req.query))
})

// GET /api/content/:id —— 统一内容详情（含 markdown 正文）
router.get('/:id', (req, res) => {
  const item = allContent().find((i) => i.id === req.params.id)
  if (!item) return res.status(404).json({ message: '内容不存在' })
  res.json(item)
})

// POST /api/content —— 新增内容（需登录）
router.post('/', requireAuth, (req, res) => {
  const body = req.body || {}
  const invalid = validateContent(body)
  if (invalid) return res.status(400).json({ message: invalid })
  res.json(createItem(body))
})

// PUT /api/content/:id —— 修改内容（需登录）
router.put('/:id', requireAuth, (req, res) => {
  const body = req.body || {}
  const invalid = validateContent(body, { partial: true })
  if (invalid) return res.status(400).json({ message: invalid })
  const item = updateItem(req.params.id, body)
  if (!item) return res.status(404).json({ message: '内容不存在' })
  res.json(item)
})

// DELETE /api/content/:id —— 删除内容（需登录）
router.delete('/:id', requireAuth, (req, res) => {
  const ok = removeItem(req.params.id)
  if (!ok) return res.status(404).json({ message: '内容不存在' })
  res.json({ ok: true, id: req.params.id })
})

export default router
