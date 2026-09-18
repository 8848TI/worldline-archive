// 一次性数据迁移：server/data/*.json → SQLite
// 运行：npm run db:migrate
//
// 特性：
//   * 全程一个事务，失败整体回滚，不会写进半截数据
//   * 用 INSERT OR REPLACE，按主键覆盖，脚本可反复重跑不会产生重复行
//   * 只做插入/更新，不删除库里已有的行（json 里删掉的条目不会连带删除）
//   * 不改动、不删除原来的 json 文件，迁移跑通后再自行归档
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DB_FILE, db, tableCounts, closeDb } from '../db/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

function readJson(filename, fallback) {
  const file = path.join(DATA_DIR, filename)
  if (!fs.existsSync(file)) {
    console.warn(`[db:migrate] 未找到 ${filename}，跳过（按空数据处理）`)
    return fallback
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

const contents = readJson('content.json', [])
const musics = readJson('music.json', [])
const tagCategories = readJson('tag-categories.json', [])
const settings = readJson('settings.json', {})

// 数组 / 对象统一序列化成 JSON 字符串存入 TEXT 列
const json = (v) => JSON.stringify(v ?? null)

const before = tableCounts()
console.log('[db:migrate] 目标库:', DB_FILE)
console.log('[db:migrate] 迁移前:', JSON.stringify(before))

db.exec('BEGIN TRANSACTION')
let inserted = 0
try {
  // ── contents ──
  const insContent = db.prepare(`
    INSERT OR REPLACE INTO contents
      (id, type, title, summary, cover, tags, extra, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const c of contents) {
    insContent.run([
      c.id,
      c.type || 'essay',
      c.title || '',
      c.summary || '',
      c.cover || '',
      json(c.tags || []),
      json(c.ext || {}), // json 里的 ext → 列名 extra
      c.createdAt || null,
      c.updatedAt || null
    ])
    inserted++
  }
  insContent.finalize()

  // ── musics ──
  const insMusic = db.prepare(`
    INSERT OR REPLACE INTO musics
      (id, title, artist, album, cover, audio_url, duration, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const m of musics) {
    insMusic.run([
      m.id,
      m.title || '',
      m.artist || '',
      m.album || '',
      m.cover || '',
      m.audioUrl || '',
      Number(m.duration) || 0,
      json(m.tags || []),
      m.createdAt || null
    ])
    inserted++
  }
  insMusic.finalize()

  // ── tag_categories（sort 记录 json 里的顺序）──
  const insTag = db.prepare('INSERT OR REPLACE INTO tag_categories (name, children, sort) VALUES (?, ?, ?)')
  tagCategories.forEach((t, i) => {
    insTag.run([t.name, json(t.children || []), i])
    inserted++
  })
  insTag.finalize()

  // ── settings（一个顶层 key 一行）──
  const insSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  for (const [key, value] of Object.entries(settings)) {
    insSetting.run([key, json(value)])
    inserted++
  }
  insSetting.finalize()

  db.exec('COMMIT')
} catch (err) {
  db.exec('ROLLBACK')
  console.error('[db:migrate] 迁移失败，已回滚:', err.message)
  closeDb()
  process.exit(1)
}

// ── 结果核对：与 json 条数逐一比对 ──
const after = tableCounts()
const expect = {
  contents: contents.length,
  musics: musics.length,
  tag_categories: tagCategories.length,
  settings: Object.keys(settings).length
}

console.log('[db:migrate] 迁移后:')
let ok = true
for (const [table, want] of Object.entries(expect)) {
  const got = after[table]
  const same = got === want
  if (!same) ok = false
  console.log(`           ${table.padEnd(15)} 库内 ${String(got).padStart(3)} 条 / json ${String(want).padStart(3)} 条  ${same ? '✓' : '✗ 不一致'}`)
}
console.log(`[db:migrate] 本次写入 ${inserted} 条`)
console.log(ok ? '[db:migrate] 数据核对通过，json 文件未做任何改动' : '[db:migrate] 存在条数不一致，请检查上面的输出')

closeDb()
if (!ok) process.exit(1)
