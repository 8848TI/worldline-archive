import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import requireAuth from '../middleware/requireAuth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const router = Router()

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/aac']
const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    cb(null, `${base}${ext}`)
  }
})

// 生成类型过滤器：不匹配时返回 400 而不是 500
function typeFilter(allowed, tip) {
  return (req, file, cb) => {
    if (allowed.includes(file.mimetype)) cb(null, true)
    else {
      const err = new Error(tip)
      err.status = 400
      cb(err)
    }
  }
}

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: typeFilter(IMAGE_TYPES, '仅支持 jpg / png / webp / gif / svg 图片')
})

const uploadVideo = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB：横幅为背景循环视频，建议 1080p / ≤20s / 3-5Mbps
  fileFilter: typeFilter(VIDEO_TYPES, '仅支持 mp4 / webm / ogg / mov 视频')
})

// 音频：各浏览器上报的 mime 不统一，类型或扩展名命中其一即放行
const uploadAudio = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (AUDIO_TYPES.includes(file.mimetype) || AUDIO_EXTS.includes(ext)) return cb(null, true)
    const err = new Error('仅支持 mp3 / wav / ogg / m4a / flac 音频')
    err.status = 400
    cb(err)
  }
})

function respond(req, res, kind) {
  if (!req.file) return res.status(400).json({ message: '未接收到文件' })
  const host = `${req.protocol}://${req.get('host')}`
  res.json({
    url: `${host}/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    kind
  })
}

// POST /api/upload —— 图片上传（需登录；multipart/form-data，字段名 file）
router.post('/', requireAuth, uploadImage.single('file'), (req, res) => respond(req, res, 'image'))

// POST /api/upload/video —— 视频上传（需登录；首页横幅等）
router.post('/video', requireAuth, uploadVideo.single('file'), (req, res) => respond(req, res, 'video'))

// POST /api/upload/audio —— 音频上传（需登录；音乐收藏）
router.post('/audio', requireAuth, uploadAudio.single('file'), (req, res) => respond(req, res, 'audio'))

export default router
