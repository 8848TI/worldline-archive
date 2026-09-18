import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

// 只匹配 /uploads/<文件名>，字符集限制为文件名安全字符，天然挡掉 ../ 这类路径穿越
const UPLOAD_URL_RE = /\/uploads\/([A-Za-z0-9._-]+)/g

// 深度遍历任意数据结构，收集其中引用到的上传文件名（去重）
export function collectUploadFiles(value, out = new Set()) {
  if (typeof value === 'string') {
    for (const m of value.matchAll(UPLOAD_URL_RE)) out.add(m[1])
  } else if (Array.isArray(value)) {
    for (const v of value) collectUploadFiles(v, out)
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectUploadFiles(v, out)
  }
  return out
}

// 删除给定文件，但跳过 remainingData 里仍被引用的（同一张图被多条内容共用时不能误删）。
// 注意：缩略图（<原名>.thumb.webp）是派生文件、不会被数据库引用，所以这里随原图一起删。
const derivedThumb = (name) => (/\.thumb\.webp$/i.test(name) ? null : name.replace(/\.[a-z0-9]+$/i, '.thumb.webp'))

export function deleteUploadFiles(files, remainingData) {
  const stillUsed = collectUploadFiles(remainingData)
  const removed = []
  for (const name of files) {
    if (name.includes('..') || stillUsed.has(name)) continue
    const targets = [name, derivedThumb(name)].filter(Boolean)
    for (const t of targets) {
      try {
        fs.unlinkSync(path.join(UPLOADS_DIR, t))
        removed.push(t)
      } catch {
        // 文件不存在或无权限：忽略，不影响删除内容本身
      }
    }
  }
  return removed
}
