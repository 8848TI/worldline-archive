import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

// 简单的 JSON 文件存储层。
// 路由层只调用 storage.readXxx / writeXxx，不直接接触 fs；
// 后续迁移到 SQLite / MySQL 时，只需替换本模块内部实现即可，业务路由无需改动。

function readJson(filename, fallback = []) {
  const file = path.join(DATA_DIR, filename)
  try {
    if (!fs.existsSync(file)) return fallback
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    console.error(`[storage] 读取 ${filename} 失败:`, err.message)
    return fallback
  }
}

function writeJson(filename, data) {
  const file = path.join(DATA_DIR, filename)
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  return true
}

export const storage = {
  readContent: () => readJson('content.json', []),
  writeContent: (data) => writeJson('content.json', data),
  readMusic: () => readJson('music.json', []),
  writeMusic: (data) => writeJson('music.json', data),
  // 两级标签体系（大类 / 子小类）
  readTagCategories: () => readJson('tag-categories.json', []),
  writeTagCategories: (data) => writeJson('tag-categories.json', data),
  // 站点设置（首页横幅视频等）
  readSettings: () => readJson('settings.json', { hero: { video: '', image: '' } }),
  writeSettings: (data) => writeJson('settings.json', data)
}
