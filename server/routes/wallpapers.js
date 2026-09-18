import { Router } from 'express'
import { storage } from '../utils/storage.js'

const router = Router()

// GET /api/wallpapers —— 将 type=wallpaper 的内容按图片逐条展开，供瀑布流使用
router.get('/', (req, res) => {
  const wallpapers = storage.readContent().filter((i) => i.type === 'wallpaper')
  const images = []
  for (const w of wallpapers) {
    for (const img of w.ext?.wallpaper?.images || []) {
      images.push({
        id: `${w.id}-${String(img.url).split('/').pop()}`,
        parentId: w.id,
        title: img.title || w.title,
        url: img.url,
        width: img.width || 800,
        height: img.height || 600,
        tags: w.tags || [],
        createdAt: w.createdAt
      })
    }
  }
  images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ list: images, total: images.length })
})

export default router
