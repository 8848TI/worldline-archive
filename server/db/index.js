import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sqlite from 'node-sqlite3-wasm'

const { Database } = sqlite

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 数据库文件位置：默认 server/data/worldline.db（与 json 数据同目录），可用环境变量 DB_FILE 覆盖。
// 该文件已在 .gitignore 中排除，属于本地数据，不要提交。
export const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(__dirname, '..', 'data', 'worldline.db')

// 表清单：迁移脚本、统计数据、以后的存储层都从这里取，避免各处硬编码
export const TABLES = ['contents', 'musics', 'tag_categories', 'settings', 'meta']

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })

// 说明：这里用 node-sqlite3-wasm（真 SQLite 的 WebAssembly 构建），
// 不需要本地编译，跨平台一致；代价是必须手动 close()，否则会有内存泄漏。
export const db = new Database(DB_FILE)

// 建表（schema.sql 内全部是 IF NOT EXISTS，可重复执行）
export function initSchema() {
  db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8'))
}

export function listTables() {
  return db
    .all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .map((r) => r.name)
}

export function tableCounts() {
  const out = {}
  for (const t of TABLES) out[t] = db.get(`SELECT COUNT(*) AS n FROM ${t}`).n
  return out
}

export function closeDb() {
  db.close()
}

// 模块被引入时即保证库文件与表结构存在
initSchema()
