import { Router } from 'express'
import { checkCredentials, signToken, verifyToken } from '../utils/auth.js'
import { loginRateLimit } from '../middleware/rateLimit.js'

const router = Router()

// 登录限流：同一 IP 连续失败 5 次锁 10 分钟（成功即清零）
const limiter = loginRateLimit({ max: 5, windowMs: 10 * 60 * 1000 })

// POST /api/auth/login —— 后台登录，成功返回 token
router.post('/login', limiter.middleware, (req, res) => {
  const { username, password } = req.body || {}
  if (!checkCredentials(String(username || ''), String(password || ''))) {
    req.recordLoginFailure()
    return res.status(401).json({ message: '账号或密码错误' })
  }
  limiter.reset(req.ip)
  res.json({ token: signToken(username), username })
})

// GET /api/auth/check —— 校验当前 token 是否有效
router.get('/check', (req, res) => {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ message: '未登录' })
  res.json({ ok: true, username: payload.u })
})

export default router
