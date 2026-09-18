import { Router } from 'express'

const router = Router()

// 接口清单（JSON）。完整的字段说明见 docs/API.md
const endpoints = [
  { method: 'POST', path: '/api/auth/login', desc: '后台登录，返回 token', body: '{ username, password }' },
  { method: 'GET', path: '/api/auth/check', desc: '校验 token 是否有效', auth: true },
  { method: 'GET', path: '/api/content', desc: '统一内容列表', query: 'type, tag, keyword, sort, page, pageSize' },
  { method: 'GET', path: '/api/content/:id', desc: '内容详情（含 markdown 正文）' },
  { method: 'POST', path: '/api/content', desc: '新增内容（type=music 写入 music.json，其余写入 content.json）', auth: true },
  { method: 'PUT', path: '/api/content/:id', desc: '修改内容', auth: true },
  { method: 'DELETE', path: '/api/content/:id', desc: '删除内容', auth: true },
  { method: 'GET', path: '/api/music', desc: '音乐列表', query: 'keyword' },
  { method: 'GET', path: '/api/music/:id', desc: '单曲详情' },
  { method: 'GET', path: '/api/wallpapers', desc: '壁纸图片列表（瀑布流）' },
  { method: 'GET', path: '/api/tags', desc: '标签聚合与计数' },
  { method: 'GET', path: '/api/tag-categories', desc: '两级标签体系（大类 + 子小类）' },
  { method: 'POST', path: '/api/tag-categories', desc: '新增大类或子小类（body: { parent?, name }）', auth: true },
  { method: 'DELETE', path: '/api/tag-categories', desc: '删除大类或子小类（query: parent?, name）', auth: true },
  { method: 'GET', path: '/api/timeline', desc: '时间线分组（按时间倒序）', query: 'year' },
  { method: 'GET', path: '/api/settings', desc: '站点设置（首页横幅视频/轮播等）' },
  { method: 'PUT', path: '/api/settings', desc: '更新站点设置（浅合并）', auth: true },
  { method: 'POST', path: '/api/upload', desc: '图片上传（multipart/form-data，字段名 file）', auth: true },
  { method: 'POST', path: '/api/upload/video', desc: '视频上传（mp4/webm，≤30MB）', auth: true },
  { method: 'POST', path: '/api/upload/audio', desc: '音频上传（mp3/wav/ogg/m4a/flac，≤30MB）', auth: true }
]

// GET /api/docs —— 接口清单
router.get('/', (req, res) => {
  res.json({
    name: '世界线存档 API',
    baseUrl: '/api',
    auth: '标注 auth:true 的接口需带请求头 Authorization: Bearer <token>（由 /api/auth/login 获取）',
    endpoints
  })
})

export default router
