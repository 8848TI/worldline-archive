import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

// 上传图片的压缩与缩略图。
//
// 为什么要做：壁纸/横幅动辄 3-5MB，原图直传直发会拖慢列表首屏、白耗流量。
// 策略：
//   * 原图超过宽度上限或体积阈值时，等比缩到 MAX_WIDTH 并存成 webp（体积通常降到 1/5 左右）
//   * 无论是否重编码，都额外生成一张 THUMB_WIDTH 宽的缩略图，供列表/网格使用
//   * SVG（矢量，栅格化没意义）和 GIF（会丢动画）原样保留，只记原图
// 缩略图命名约定：<原名去扩展名>.thumb.webp —— 前端按同一约定拼地址（utils/imageUrl.js）。

const MAX_WIDTH = Number(process.env.IMAGE_MAX_WIDTH) || 1920
const THUMB_WIDTH = Number(process.env.IMAGE_THUMB_WIDTH) || 480
const RECODE_BYTES = 300 * 1024 // 小于这个体积且不超宽就不重编码，省 CPU
const SKIP_MIME = ['image/svg+xml', 'image/gif']

const thumbNameOf = (filename) => `${path.basename(filename, path.extname(filename))}.thumb.webp`

export async function processImage(file) {
  const originalUrl = `/uploads/${file.filename}`
  if (SKIP_MIME.includes(file.mimetype)) {
    return { url: originalUrl, thumb: null, skipped: '按类型跳过压缩' }
  }

  const dir = path.dirname(file.path)
  const base = path.basename(file.filename, path.extname(file.filename))
  const webpPath = path.join(dir, `${base}.webp`)
  const thumbPath = path.join(dir, thumbNameOf(file.filename))
  const thumbUrl = `/uploads/${thumbNameOf(file.filename)}`

  try {
    const meta = await sharp(file.path, { failOn: 'none' }).metadata()
    const width = meta.width || 0
    const needsRecode = width > MAX_WIDTH || file.size > RECODE_BYTES

    // 缩略图：列表/网格用
    await sharp(file.path, { failOn: 'none' })
      .rotate() // 按 EXIF 摆正
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath)

    if (!needsRecode) {
      return { url: originalUrl, thumb: thumbUrl, note: `原图 ${width}px / ${(file.size / 1024).toFixed(0)}KB，未再压缩` }
    }

    await sharp(file.path, { failOn: 'none' })
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpPath)

    const after = fs.statSync(webpPath).size
    // 只有确实变小了才替换掉原图，否则保留原文件
    if (after < file.size) {
      fs.unlinkSync(file.path)
      return {
        url: `/uploads/${base}.webp`,
        thumb: thumbUrl,
        note: `${width}px/${(file.size / 1024).toFixed(0)}KB → ${MAX_WIDTH}px上限 webp ${(after / 1024).toFixed(0)}KB`
      }
    }
    fs.unlinkSync(webpPath)
    return { url: originalUrl, thumb: thumbUrl, note: '压缩后反而更大，保留原图' }
  } catch (err) {
    // 处理失败不能影响上传本身：退回原图
    console.error('[image] 压缩失败，保留原图:', err.message)
    try {
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath)
    } catch {
      /* 忽略 */
    }
    return { url: originalUrl, thumb: null, note: '压缩失败，保留原图' }
  }
}

// 给单个文件补缩略图（用于维护脚本与历史文件回填）
// 跳过：矢量/动图、本身就是缩略图的文件、已存在缩略图的文件
export async function generateThumb(filePath) {
  const name = path.basename(filePath)
  const ext = path.extname(name).toLowerCase()
  if (ext === '.svg' || ext === '.gif') return null
  if (name.endsWith('.thumb.webp')) return null
  const thumbPath = path.join(path.dirname(filePath), thumbNameOf(name))
  if (fs.existsSync(thumbPath)) return null
  try {
    await sharp(filePath, { failOn: 'none' })
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath)
    return thumbPath
  } catch (err) {
    console.error('[image] 生成缩略图失败:', name, err.message)
    return null
  }
}
