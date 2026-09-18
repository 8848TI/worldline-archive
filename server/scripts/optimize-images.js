// 压缩 uploads/ 里已有的过大图片，并把数据库中的引用改到新文件。
//
// 背景：压缩逻辑已加在上传接口上，但此前传的图仍是原图（横幅那几张 PNG 有 2-3MB）。
// 本脚本对超过阈值的老图就地优化：生成 webp → 改写引用 → 删除原图。
//
// 运行：npm run images:optimize        （建议先跑一次 npm run db:backup）
// 幂等：已是 webp、或是缩略图、或本来就小于阈值，会跳过。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { db, closeDb } from '../db/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
const MAX_WIDTH = Number(process.env.IMAGE_MAX_WIDTH) || 1920
const MIN_BYTES = Number(process.env.IMAGE_MIN_BYTES) || 300 * 1024 // 小于这个体积不动
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.avif', '.tiff', '.bmp']

// Windows 上 sharp 读完文件后句柄可能还没释放，直接 unlink 会 EPERM，需要重试
async function unlinkWithRetry(file, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      fs.unlinkSync(file)
      return true
    } catch (err) {
      if (err.code !== 'EPERM' && err.code !== 'EBUSY') throw err
      await new Promise((r) => setTimeout(r, 250))
    }
  }
  return false
}

const files = fs
  .readdirSync(UPLOADS_DIR)
  .filter((f) => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
  .filter((f) => !f.endsWith('.thumb.webp'))

let savedBytes = 0
const changed = []

for (const name of files) {
  const src = path.join(UPLOADS_DIR, name)
  const size = fs.statSync(src).size
  if (size < MIN_BYTES) continue

  const base = path.basename(name, path.extname(name))
  const webpName = `${base}.webp`
  const webpPath = path.join(UPLOADS_DIR, webpName)

  try {
    await sharp(src, { failOn: 'none' })
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpPath)
  } catch (err) {
    console.log(`  跳过 ${name}（处理失败：${err.message}）`)
    continue
  }

  const after = fs.statSync(webpPath).size
  if (after >= size) {
    fs.unlinkSync(webpPath)
    console.log(`  跳过 ${name}（压缩后更大）`)
    continue
  }

  // 改写数据库里对这张图的引用，再删原图
  const from = `/uploads/${name}`
  const to = `/uploads/${webpName}`
  db.exec('BEGIN TRANSACTION')
  try {
    db.run('UPDATE contents SET cover = REPLACE(cover, ?, ?) WHERE cover LIKE ?', [from, to, `%${from}%`])
    db.run('UPDATE contents SET extra = REPLACE(extra, ?, ?) WHERE extra LIKE ?', [from, to, `%${from}%`])
    db.run('UPDATE musics SET cover = REPLACE(cover, ?, ?) WHERE cover LIKE ?', [from, to, `%${from}%`])
    db.run('UPDATE settings SET value = REPLACE(value, ?, ?) WHERE value LIKE ?', [from, to, `%${from}%`])
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    fs.unlinkSync(webpPath)
    console.log(`  跳过 ${name}（引用改写失败：${err.message}）`)
    continue
  }

  const removed = await unlinkWithRetry(src)
  if (!removed) {
    console.log(`  ! ${name} 原图被占用删不掉，已改指到 ${webpName}，原图可稍后手动清理`)
  }
  savedBytes += size - after
  changed.push(`${name} → ${webpName}`)
  console.log(`  ${name}  ${(size / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`)
}

console.log(`\n[images:optimize] 处理 ${changed.length} 个文件，节省 ${(savedBytes / 1024 / 1024).toFixed(2)} MB`)
if (!changed.length) console.log('  没有需要处理的文件（都小于阈值或已是 webp）')

// 残留检查：确认没有引用还指向已删除的原图
const refs = JSON.stringify([db.all('SELECT cover, extra FROM contents'), db.all('SELECT cover FROM musics'), db.all('SELECT value FROM settings')])
const dangling = files.filter((f) => !fs.existsSync(path.join(UPLOADS_DIR, f)) && refs.includes(`/uploads/${f}`))
console.log(dangling.length ? `  ✗ 有 ${dangling.length} 处引用指向已删除文件：${dangling.join(', ')}` : '  ✓ 无悬空引用')

closeDb()
