import { verifyToken } from '../utils/auth.js'

// 写接口鉴权中间件：要求请求头带 Authorization: Bearer <token>
// 用法：router.post('/', requireAuth, handler)
export default function requireAuth(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ message: '未登录或登录已过期，请重新登录' })
  }

  req.user = payload
  next()
}
