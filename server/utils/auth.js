import crypto from 'node:crypto'

// 简易后台鉴权：无状态 token（HMAC-SHA256 签名），不依赖数据库。
// 账号密码与密钥可通过环境变量覆盖：
//   ADMIN_USER / ADMIN_PASS / ADMIN_SECRET / ADMIN_TOKEN_TTL
const SECRET = process.env.ADMIN_SECRET || 'worldline-archive-default-secret-change-me'
const USER = process.env.ADMIN_USER || 'root'
const PASS = process.env.ADMIN_PASS || '123456'
const TTL = Number(process.env.ADMIN_TOKEN_TTL) || 7 * 24 * 60 * 60 * 1000 // 默认 7 天

export const DEFAULT_SECRET = SECRET
export const AUTH_CONFIG = { user: USER, ttl: TTL }

// 签发 token：base64url(payload).签名
export function signToken(username) {
  const payload = JSON.stringify({ u: username, exp: Date.now() + TTL })
  const data = Buffer.from(payload).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

// 校验 token，返回 payload 或 null
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null

  const expect = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expect)
  // 定长比较，避免时序攻击
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'))
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function checkCredentials(username, password) {
  return username === USER && password === PASS
}
