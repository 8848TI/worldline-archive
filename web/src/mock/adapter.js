// 前端 mock 适配器：替换 axios 默认网络适配器，让所有接口请求走本地数据。
// 支持读写：写入的数据会持久化到 localStorage，刷新后仍在；
// 清空演示数据可在控制台执行 localStorage.removeItem('worldline-mock-store')。
// 路由规则与后端 routes/* 完全对齐，切换真实接口只需关闭 mock（VITE_USE_MOCK=false）。
import { mockContent } from './data/content'
import { mockMusic } from './data/music'
import { defaultTagCategories } from './data/tagCategories'
import { defaultSettings } from './data/settings'

const STORE_KEY = 'worldline-mock-store'

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── 数据仓库：首次从内置数据初始化，之后从 localStorage 恢复 ──
let store = null

function getStore() {
  if (store) return store
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved) {
      store = JSON.parse(saved)
      // 兼容旧版 localStorage：补齐后新增的数据段
      if (!store.tagCategories) store.tagCategories = JSON.parse(JSON.stringify(defaultTagCategories))
      if (!store.settings) store.settings = JSON.parse(JSON.stringify(defaultSettings))
      return store
    }
  } catch (e) {
    /* 解析失败则回退到内置数据 */
  }
  store = {
    content: JSON.parse(JSON.stringify(mockContent)),
    music: JSON.parse(JSON.stringify(mockMusic)),
    tagCategories: JSON.parse(JSON.stringify(defaultTagCategories)),
    settings: JSON.parse(JSON.stringify(defaultSettings))
  }
  return store
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch (e) {
    /* 忽略写入失败（如隐私模式） */
  }
}

// 将 music 条目映射为统一 Content 结构，供 /content 与 /timeline 使用
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
  const s = getStore()
  return [...s.content, ...s.music.map(musicToContent)]
}

// 通用筛选 / 排序 / 分页（与后端 content 路由逻辑保持一致）
function applyQuery(list, query = {}) {
  let result = [...list]
  const { type, tag, keyword, sort } = query || {}
  const page = Math.max(1, parseInt(query?.page, 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(query?.pageSize, 10) || 12))

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

function notFound(msg) {
  const err = new Error(msg)
  err.status = 404
  return err
}

function unauthorized(msg = '未登录或登录已过期，请重新登录') {
  const err = new Error(msg)
  err.status = 401
  return err
}

// ── 后台登录（与后端默认账号一致；真实环境由后端校验签名） ──
const MOCK_USER = 'root'
const MOCK_PASS = '123456'

function requireToken(config) {
  const h = config?.headers?.Authorization || config?.headers?.authorization || ''
  if (!String(h).startsWith('Bearer ')) throw unauthorized()
}

// ── 写操作（对齐后端 content 路由） ──
function createItem(body = {}) {
  const s = getStore()
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
    s.music.unshift(track)
    persist()
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
  s.content.unshift(item)
  persist()
  return item
}

function updateItem(id, body = {}) {
  const s = getStore()
  const now = new Date().toISOString()

  const mi = s.music.findIndex((m) => m.id === id)
  if (mi >= 0) {
    const m = body.ext?.music || {}
    s.music[mi] = {
      ...s.music[mi],
      title: body.title ?? s.music[mi].title,
      artist: m.artist ?? s.music[mi].artist,
      album: m.album ?? s.music[mi].album,
      cover: body.cover ?? s.music[mi].cover,
      audioUrl: m.audioUrl ?? s.music[mi].audioUrl,
      tags: body.tags ?? s.music[mi].tags
    }
    persist()
    return s.music[mi]
  }

  const i = s.content.findIndex((x) => x.id === id)
  if (i < 0) return null
  s.content[i] = {
    ...s.content[i],
    title: body.title ?? s.content[i].title,
    summary: body.summary ?? s.content[i].summary,
    cover: body.cover ?? s.content[i].cover,
    tags: body.tags ?? s.content[i].tags,
    ext: body.ext ?? s.content[i].ext,
    updatedAt: now
  }
  persist()
  return s.content[i]
}

function removeItem(id) {
  const s = getStore()
  const mi = s.music.findIndex((m) => m.id === id)
  if (mi >= 0) {
    s.music.splice(mi, 1)
    persist()
    return true
  }
  const i = s.content.findIndex((x) => x.id === id)
  if (i < 0) return false
  s.content.splice(i, 1)
  persist()
  return true
}

// 核心路由：根据 url 与 method 返回对应的 mock 数据
function route(url, method, params, config) {
  const seg = String(url)
    .split('?')[0]
    .split('/')
    .filter(Boolean)
  const s = getStore()

  // 写操作需要登录（与后端 requireAuth 行为一致）
  const WRITE_METHODS = ['post', 'put', 'delete']
  const PROTECTED = ['content', 'upload', 'tag-categories', 'settings']
  if (WRITE_METHODS.includes(method) && PROTECTED.includes(seg[0])) {
    requireToken(config)
  }

  // /auth
  if (seg[0] === 'auth') {
    if (seg[1] === 'login' && method === 'post') {
      const { username, password } = config?.data || {}
      if (username !== MOCK_USER || password !== MOCK_PASS) {
        throw unauthorized('账号或密码错误')
      }
      return { token: `mock-${Date.now().toString(36)}`, username }
    }
    if (seg[1] === 'check') {
      requireToken(config)
      return { ok: true, username: MOCK_USER }
    }
  }

  // /content
  if (seg[0] === 'content') {
    if (method === 'post') return createItem(config?.data || {})
    if (seg[1]) {
      if (method === 'put') {
        const item = updateItem(seg[1], config?.data || {})
        if (!item) throw notFound('内容不存在')
        return item
      }
      if (method === 'delete') {
        if (!removeItem(seg[1])) throw notFound('内容不存在')
        return { ok: true, id: seg[1] }
      }
      const item = allContent().find((i) => i.id === seg[1])
      if (!item) throw notFound('内容不存在')
      return item
    }
    return applyQuery(allContent(), params)
  }

  // /music
  if (seg[0] === 'music') {
    if (seg[1]) {
      const item = s.music.find((m) => m.id === seg[1])
      if (!item) throw notFound('曲目不存在')
      return item
    }
    let list = [...s.music]
    if (params?.keyword) {
      const kw = String(params.keyword).toLowerCase()
      list = list.filter((m) => `${m.title}${m.artist}${m.album || ''}`.toLowerCase().includes(kw))
    }
    return { list, total: list.length }
  }

  // /wallpapers
  if (seg[0] === 'wallpapers') {
    const images = []
    for (const w of s.content.filter((i) => i.type === 'wallpaper')) {
      for (const img of w.ext?.wallpaper?.images || []) {
        images.push({
          id: `${w.id}-${String(img.url).split('/').pop()}`,
          parentId: w.id,
          title: img.title || w.title,
          url: img.url,
          width: img.width || 800,
          height: img.height || 600,
          tags: w.tags || [],
          createdAt: w.createdAt
        })
      }
    }
    images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { list: images, total: images.length }
  }

  // /tags
  if (seg[0] === 'tags') {
    const counts = {}
    for (const item of allContent()) {
      for (const t of item.tags || []) counts[t] = (counts[t] || 0) + 1
    }
    const list = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
    return { list, total: list.length }
  }

  // /tag-categories
  if (seg[0] === 'tag-categories') {
    if (method === 'post') {
      const { parent = '', name } = config?.data || {}
      const n = String(name || '').trim()
      if (!n) throw notFound('名称不能为空')
      if (!parent) {
        if (!s.tagCategories.some((c) => c.name === n)) s.tagCategories.push({ name: n, children: [] })
      } else {
        const cat = s.tagCategories.find((c) => c.name === parent)
        if (!cat) throw notFound('大类不存在')
        if (!Array.isArray(cat.children)) cat.children = []
        if (!cat.children.includes(n)) cat.children.push(n)
      }
      persist()
      return { list: s.tagCategories }
    }
    if (method === 'delete') {
      const parent = String(params?.parent || '')
      const n = String(params?.name || '').trim()
      if (!n) throw notFound('名称不能为空')
      if (!parent) {
        s.tagCategories = s.tagCategories.filter((c) => c.name !== n)
      } else {
        const cat = s.tagCategories.find((c) => c.name === parent)
        if (!cat) throw notFound('大类不存在')
        if (Array.isArray(cat.children)) cat.children = cat.children.filter((x) => x !== n)
      }
      persist()
      return { list: s.tagCategories }
    }
    return { list: s.tagCategories }
  }

  // /timeline
  if (seg[0] === 'timeline') {
    const all = allContent()
    const { year } = params || {}
    let filtered = year ? all.filter((i) => new Date(i.createdAt).getFullYear() === Number(year)) : all
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const groups = []
    const map = new Map()
    for (const item of filtered) {
      const d = new Date(item.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!map.has(key)) {
        const g = { date: key, items: [] }
        map.set(key, g)
        groups.push(g)
      }
      map.get(key).items.push(item)
    }
    const years = [...new Set(filtered.map((i) => new Date(i.createdAt).getFullYear()))].sort((a, b) => b - a)
    return { groups, years, total: filtered.length }
  }

  // /settings
  if (seg[0] === 'settings') {
    if (method === 'put') {
      s.settings = { ...s.settings, ...(config?.data || {}) }
      persist()
      return s.settings
    }
    return s.settings
  }

  // POST /upload、/upload/video、/upload/audio（mock：返回占位 URL）
  if (seg[0] === 'upload' && method === 'post') {
    const file = config?.data?.get ? config.data.get('file') : null
    const name = file?.name || 'file'
    const kind = seg[1] || 'image'
    const placeholder = {
      video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      image: `https://picsum.photos/seed/${encodeURIComponent(name)}/1200/800`
    }[kind] || `https://picsum.photos/seed/${encodeURIComponent(name)}/1200/800`
    return {
      url: placeholder,
      filename: name,
      size: file?.size || 0,
      mimetype: file?.type || 'application/octet-stream',
      kind
    }
  }

  throw notFound('未知的 mock 接口')
}

// 挂载到 axios 实例的 defaults.adapter
export function setupMock(axiosInstance) {
  axiosInstance.defaults.adapter = async (config) => {
    await delay(180)
    const url = String(config.url || '').replace(/^\/api/, '')
    const method = String(config.method || 'get').toLowerCase()
    const params = config.params || {}

    try {
      const payload = route(url, method, params, config)
      return { data: payload, status: 200, statusText: 'OK', headers: {}, config, request: {} }
    } catch (err) {
      return Promise.reject({
        response: { data: { message: err.message }, status: err.status || 500 },
        config
      })
    }
  }
}
