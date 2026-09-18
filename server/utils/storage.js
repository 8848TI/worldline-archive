import { db } from '../db/index.js'

// 存储层：SQLite（node-sqlite3-wasm，同步 API）。
//
// 历史沿革：本模块原先读写 server/data/*.json，迁移到 SQLite 后仍然对外提供同名的
// readXxx 接口，所以路由层基本不用改；写操作则改成行级接口（insert/update/delete），
// 避免「改一篇文章就把整张表重写一遍」。
//
// 数据形状与前端字段严格保持一致：库里的 extra / tags 存 JSON 字符串，
// created_at 存 ISO8601 字符串，取出来时还原成 ext / tags / createdAt 等原字段名。
//
// 回退/再导入：npm run db:migrate 可把 server/data/*.json 的内容重新导入库（按 id 覆盖）。

const parseJson = (text, fallback) => {
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

// ── 行 → 前端既有结构 ──
function rowToContent(r) {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    summary: r.summary,
    cover: r.cover,
    tags: parseJson(r.tags, []),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    ext: parseJson(r.extra, {})
  }
}

function rowToMusic(r) {
  return {
    id: r.id,
    title: r.title,
    artist: r.artist,
    album: r.album,
    cover: r.cover,
    audioUrl: r.audio_url,
    duration: r.duration,
    tags: parseJson(r.tags, []),
    createdAt: r.created_at
  }
}

// 按 rowid 排序 = 迁移时的插入顺序，与原先 json 数组顺序一致
const ORDER = 'ORDER BY rowid'

export const storage = {
  // ────────── 文章 / 随笔 / 动漫 / 影视 / 漫画 / 壁纸 / 项目 / 工具 ──────────
  readContent: () => db.all(`SELECT * FROM contents ${ORDER}`).map(rowToContent),

  insertContent(item) {
    db.run(
      `INSERT INTO contents (id, type, title, summary, cover, tags, extra, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.type,
        item.title || '',
        item.summary || '',
        item.cover || '',
        JSON.stringify(item.tags || []),
        JSON.stringify(item.ext || {}),
        item.createdAt || null,
        item.updatedAt || item.createdAt || null
      ]
    )
    return item
  },

  // 只更新传入的字段，未传的保持原值
  updateContent(id, patch) {
    const cols = {
      type: 'type',
      title: 'title',
      summary: 'summary',
      cover: 'cover',
      tags: 'tags',
      ext: 'extra',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
    const sets = []
    const values = []
    for (const [key, col] of Object.entries(cols)) {
      if (!(key in patch)) continue
      sets.push(`${col} = ?`)
      values.push(key === 'tags' || key === 'ext' ? JSON.stringify(patch[key] ?? (key === 'tags' ? [] : {})) : patch[key])
    }
    if (!sets.length) return this.findContent(id)
    db.run(`UPDATE contents SET ${sets.join(', ')} WHERE id = ?`, [...values, id])
    return this.findContent(id)
  },

  deleteContent: (id) => db.run('DELETE FROM contents WHERE id = ?', [id]),

  findContent: (id) => {
    const row = db.get('SELECT * FROM contents WHERE id = ?', [id])
    return row ? rowToContent(row) : null
  },

  // ────────── 音乐 ──────────
  readMusic: () => db.all(`SELECT * FROM musics ${ORDER}`).map(rowToMusic),

  insertMusic(track) {
    db.run(
      `INSERT INTO musics (id, title, artist, album, cover, audio_url, duration, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        track.id,
        track.title || '',
        track.artist || '',
        track.album || '',
        track.cover || '',
        track.audioUrl || '',
        Number(track.duration) || 0,
        JSON.stringify(track.tags || []),
        track.createdAt || null
      ]
    )
    return track
  },

  updateMusic(id, patch) {
    const cols = {
      title: 'title',
      artist: 'artist',
      album: 'album',
      cover: 'cover',
      audioUrl: 'audio_url',
      duration: 'duration',
      tags: 'tags',
      createdAt: 'created_at'
    }
    const sets = []
    const values = []
    for (const [key, col] of Object.entries(cols)) {
      if (!(key in patch)) continue
      sets.push(`${col} = ?`)
      values.push(key === 'tags' ? JSON.stringify(patch[key] || []) : patch[key])
    }
    if (!sets.length) return this.findMusic(id)
    db.run(`UPDATE musics SET ${sets.join(', ')} WHERE id = ?`, [...values, id])
    return this.findMusic(id)
  },

  deleteMusic: (id) => db.run('DELETE FROM musics WHERE id = ?', [id]),

  findMusic: (id) => {
    const row = db.get('SELECT * FROM musics WHERE id = ?', [id])
    return row ? rowToMusic(row) : null
  },

  // ────────── 两级标签（表很小，整表替换即可）──────────
  readTagCategories: () =>
    db.all(`SELECT name, children FROM tag_categories ORDER BY sort, rowid`).map((r) => ({
      name: r.name,
      children: parseJson(r.children, [])
    })),

  writeTagCategories(list) {
    db.exec('BEGIN TRANSACTION')
    try {
      db.run('DELETE FROM tag_categories')
      list.forEach((t, i) => db.run('INSERT INTO tag_categories (name, children, sort) VALUES (?, ?, ?)', [t.name, JSON.stringify(t.children || []), i]))
      db.exec('COMMIT')
    } catch (err) {
      db.exec('ROLLBACK')
      throw err
    }
    return true
  },

  // ────────── 站点设置（一个顶层 key 一行，整表替换）──────────
  readSettings: () => {
    const out = {}
    for (const r of db.all(`SELECT key, value FROM settings ${ORDER}`)) out[r.key] = parseJson(r.value, {})
    // 与旧实现保持一致的兜底结构
    return Object.keys(out).length ? out : { hero: { video: '', image: '' } }
  },

  writeSettings(obj) {
    db.exec('BEGIN TRANSACTION')
    try {
      db.run('DELETE FROM settings')
      for (const [key, value] of Object.entries(obj || {})) {
        db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, JSON.stringify(value ?? null)])
      }
      db.exec('COMMIT')
    } catch (err) {
      db.exec('ROLLBACK')
      throw err
    }
    return true
  }
}
