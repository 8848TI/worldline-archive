import { Router } from 'express'
import { checkCredentials, signToken, verifyToken } from '../utils/auth.js'

const router = Router()

// POST /api/auth/login —— 后台登录，成功返回 token
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!checkCredentials(String(username || ''), String(password || ''))) {
    return res.status(401).json({ message: '账号或密码错误' })
  }
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
