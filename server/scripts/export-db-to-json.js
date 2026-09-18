// 把数据库导出回 server/data/*.json
//
// 运行：npm run db:export
//
// 为什么要留着这四个 json：
//   * 运行时的唯一数据源是 worldline.db，json 完全不被读写；
//   * 但 .db 与 uploads/ 都在 .gitignore 里，所以 json 是**版本库里唯一的内容存档**，
//     可读、可 diff、可作为 db:migrate 的导入源（例如换机器、重建库）；
//   * 内容改动后（或提交前）跑一次本脚本，让存档与库保持一致，
//     否则 db:migrate 会把过期数据写回库——比如图片压缩后旧文件名已不存在。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storage } from '../utils/storage.js'
import { closeDb } from '../db/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

const files = {
  'content.json': storage.readContent(),
  'music.json': storage.readMusic(),
  'tag-categories.json': storage.readTagCategories(),
  'settings.json': storage.readSettings()
}

for (const [name, data] of Object.entries(files)) {
  const file = path.join(DATA_DIR, name)
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : ''
  const after = JSON.stringify(data, null, 2)
  const count = Array.isArray(data) ? data.length : Object.keys(data).length
  if (before === after) {
    console.log(`  = ${name} 无变化（${count} 项）`)
  } else {
    fs.writeFileSync(file, after)
    console.log(`  ✓ ${name} 已更新（${count} 项）`)
  }
}

closeDb()
console.log('[db:export] 完成：json 存档已与数据库保持一致')
