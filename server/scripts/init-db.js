// 初始化 SQLite 数据库：创建库文件与所有表（幂等，可重复执行）
// 运行：npm run db:init
import fs from 'node:fs'
import path from 'node:path'
import { DB_FILE, initSchema, listTables, tableCounts, TABLES, closeDb } from '../db/index.js'

console.log('[db:init] 数据库文件:', DB_FILE)

// 注意：db/index.js 在模块加载时已执行过建表（IF NOT EXISTS），这里再跑一次用于确认结构
initSchema()

const size = fs.statSync(DB_FILE).size
console.log('[db:init] 库文件与表结构已就绪（建表语句幂等，可重复执行）')
console.log('[db:init] 表:', listTables().join(', '))

const counts = tableCounts()
console.log('[db:init] 当前行数:')
for (const t of TABLES) console.log(`           ${t.padEnd(15)} ${counts[t]}`)

const dataRows = counts.contents + counts.musics
if (dataRows === 0) {
  console.log('[db:init] 库还是空的，可执行 npm run db:migrate 把 data/*.json 的数据导入')
}

console.log('[db:init] 文件大小:', (size / 1024).toFixed(1), 'KB')
closeDb()
