import { Router } from 'express'
import { storage } from '../utils/storage.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

// 将 music 条目映射为统一 Content 结构，供 /content 与 /timeline 共用
function musicToContent(m) {
  return {
    id: m.id,
    type: 'music',
    title: m.title,
    summary: `${m.artist} · ${m.album || '单曲'}`,
    cover: m.cover,
    tags: m.tags || [],
    createdAt: m.createdAt,
    updatedAt: m.createdAt,
    ext: { music: { artist: m.artist, album: m.album, audioUrl: m.audioUrl, duration: m.duration } }
  }
}

function allContent() {
  return [...storage.readContent(), ...storage.readMusic().map(musicToContent)]
}

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
    result = result.filter((i) => `${i.title}${i.summary}`.toLowerCase().includes(kw))
  }
  if (sort === 'rating') result.sort((a, b) => (b.ext?.media?.rating || 0) - (a.ext?.media?.rating || 0))
  else if (sort === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = result.length
  const start = (page - 1) * pageSize
  return { list: result.slice(start, start + pageSize), total, page, pageSize }
}

// ── 新增 ──
// type=music 写入 music.json，其余类型写入 content.json
function createItem(body) {
  const now = new Date().toISOString()
  const type = body.type || 'essay'
  const id = body.id || `${type}-${Date.now().toString(36)}`

  if (type === 'music') {
    const m = body.ext?.music || {}
    const track = {
      id,
      title: body.title,
      artist: m.artist || '',
      album: m.album || '',
      cover: body.cover || '',
      audioUrl: m.audioUrl || '',
      duration: m.duration || 0,
      tags: body.tags || [],
      createdAt: now
    }
    const list = storage.readMusic()
    list.unshift(track)
    storage.writeMusic(list)
    return track
  }

  const item = {
    id,
    type,
    title: body.title,
    summary: body.summary || '',
    cover: body.cover || '',
    tags: body.tags || [],
    createdAt: now,
    updatedAt: now,
    ext: body.ext || {}
  }
  const list = storage.readContent()
  list.unshift(item)
  storage.writeContent(list)
  return item
}

// ── 修改 ──
function updateItem(id, body) {
  const now = new Date().toISOString()

  const music = storage.readMusic()
  const mi = music.findIndex((m) => m.id === id)
  if (mi >= 0) {
    const m = body.ext?.music || {}
    music[mi] = {
      ...music[mi],
      title: body.title ?? music[mi].title,
      artist: m.artist ?? music[mi].artist,
      album: m.album ?? music[mi].album,
      cover: body.cover ?? music[mi].cover,
      audioUrl: m.audioUrl ?? music[mi].audioUrl,
      duration: m.duration ?? music[mi].duration,
      tags: body.tags ?? music[mi].tags
    }
    storage.writeMusic(music)
    return music[mi]
  }

  const list = storage.readContent()
  const i = list.findIndex((x) => x.id === id)
  if (i < 0) return null
  list[i] = {
    ...list[i],
    title: body.title ?? list[i].title,
    summary: body.summary ?? list[i].summary,
    cover: body.cover ?? list[i].cover,
    tags: body.tags ?? list[i].tags,
    ext: body.ext ?? list[i].ext,
    updatedAt: now
  }
  storage.writeContent(list)
  return list[i]
}

// ── 删除 ──
function removeItem(id) {
  const music = storage.readMusic()
  const mi = music.findIndex((m) => m.id === id)
  if (mi >= 0) {
    music.splice(mi, 1)
    storage.writeMusic(music)
    return true
  }
  const list = storage.readContent()
  const i = list.findIndex((x) => x.id === id)
  if (i < 0) return false
  list.splice(i, 1)
  storage.writeContent(list)
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
  if (!body.title || !String(body.title).trim()) {
    return res.status(400).json({ message: '标题不能为空' })
  }
  res.json(createItem(body))
})

// PUT /api/content/:id —— 修改内容（需登录）
router.put('/:id', requireAuth, (req, res) => {
  const item = updateItem(req.params.id, req.body || {})
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
