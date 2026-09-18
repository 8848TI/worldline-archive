// 给 uploads/ 里已有的图片补缩略图（幂等：已有缩略图或跳过类型会略过）
// 运行：npm run images:thumbs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateThumb } from '../utils/imageProcess.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.bmp']

const files = fs.readdirSync(UPLOADS_DIR).filter((f) => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
console.log(`[thumbs] 扫描到 ${files.length} 个图片文件`)

let created = 0
let skipped = 0
for (const f of files) {
  const out = await generateThumb(path.join(UPLOADS_DIR, f))
  if (out) {
    created++
    console.log(`  生成 ${f} → ${path.basename(out)}  (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`)
  } else {
    skipped++
  }
}
console.log(`[thumbs] 新生成 ${created} 个，跳过 ${skipped} 个（已存在或无需缩略图）`)
