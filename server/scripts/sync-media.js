// 媒体异地同步：把 uploads/（图片音频视频）复制到另一块盘 / 网盘同步目录 / 已挂载的对象存储。
//
// 为什么要单独同步：内容文字有 JSON 存档进 git，但 uploads/ 被 gitignore 排除，
// 只靠本机就还是"同一块盘"。JSON 存档 + uploads 异地副本 = 完整可恢复。
//
// 用法：
//   1) 在 server/.env 里写一行：MEDIA_SYNC_TARGET=D:\backup\worldline
//   2) npm run sync:media
//
// 可选（同样写在 .env）：
//   MEDIA_SYNC_DIRS=uploads,data/backups   要同步的目录（默认只同步 uploads）
//   MEDIA_SYNC_DELETE=true                 删除目标端多余文件（默认不动，更安全）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readEnv } from '../utils/envFile.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = path.join(__dirname, '..')

const env = readEnv()
const target = env.MEDIA_SYNC_TARGET
if (!target) {
  console.error('[sync-media] 还没配置目标目录。请在 server/.env 里加一行：')
  console.error('  MEDIA_SYNC_TARGET=D:\\backup\\worldline      # Windows 示例')
  console.error('  MEDIA_SYNC_TARGET=/mnt/backup/worldline     # Linux 示例')
  process.exit(1)
}

const dirs = String(env.MEDIA_SYNC_DIRS || 'uploads')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const shouldDelete = String(env.MEDIA_SYNC_DELETE || '').toLowerCase() === 'true'

const targetRoot = path.resolve(target)

// 防止把备份写回源目录里（会无限套娃）
for (const d of dirs) {
  const src = path.resolve(SERVER_DIR, d)
  if (targetRoot === src || targetRoot.startsWith(src + path.sep)) {
    console.error(`[sync-media] 目标目录不能是源目录本身或其子目录：${d}`)
    process.exit(1)
  }
}

let copied = 0
let skipped = 0
let removed = 0
let bytes = 0

function walk(dir, rel = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const relPath = rel ? path.join(rel, e.name) : e.name
    if (e.isDirectory()) files.push(...walk(path.join(dir, e.name), relPath))
    else files.push(relPath)
  }
  return files
}

for (const d of dirs) {
  const srcRoot = path.join(SERVER_DIR, d)
  if (!fs.existsSync(srcRoot)) {
    console.log(`[sync-media] 跳过不存在的目录：${d}`)
    continue
  }
  const dstRoot = path.join(targetRoot, d)
  const files = walk(srcRoot)
  const seen = new Set()

  for (const rel of files) {
    const src = path.join(srcRoot, rel)
    const dst = path.join(dstRoot, rel)
    seen.add(rel)
    const s = fs.statSync(src)
    let needCopy = true
    if (fs.existsSync(dst)) {
      const t = fs.statSync(dst)
      // 大小 + 修改时间（秒级）都一致就跳过
      if (t.size === s.size && Math.floor(t.mtimeMs / 1000) === Math.floor(s.mtimeMs / 1000)) needCopy = false
    }
    if (!needCopy) {
      skipped++
      continue
    }
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    fs.copyFileSync(src, dst)
    // 保留修改时间，便于下次比对
    fs.utimesSync(dst, s.atime, s.mtime)
    copied++
    bytes += s.size
  }

  if (shouldDelete && fs.existsSync(dstRoot)) {
    for (const rel of walk(dstRoot)) {
      if (!seen.has(rel)) {
        fs.unlinkSync(path.join(dstRoot, rel))
        removed++
      }
    }
  }
  console.log(`[sync-media] ${d} → ${dstRoot}  文件 ${files.length} 个`)
}

console.log(`[sync-media] 完成：复制 ${copied} 个（${(bytes / 1024 / 1024).toFixed(2)} MB），跳过未变化 ${skipped} 个${shouldDelete ? `，删除多余 ${removed} 个` : ''}`)
console.log(`[sync-media] 目标：${targetRoot}`)
