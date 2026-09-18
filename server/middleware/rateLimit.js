// 极简内存限流：只给登录这类敏感接口用，不引第三方依赖。
// 只统计"失败"次数（成功会清零），所以正常使用不会被误伤。
export function loginRateLimit({ windowMs = 10 * 60 * 1000, max = 5 } = {}) {
  const attempts = new Map() // ip -> 失败时间戳数组

  const prune = (now) => {
    for (const [ip, arr] of attempts) {
      const kept = arr.filter((t) => now - t < windowMs)
      if (kept.length) attempts.set(ip, kept)
      else attempts.delete(ip)
    }
  }

  return {
    middleware(req, res, next) {
      const now = Date.now()
      prune(now)
      const arr = attempts.get(req.ip) || []
      if (arr.length >= max) {
        const waitSec = Math.ceil((windowMs - (now - arr[0])) / 1000)
        res.set('Retry-After', String(waitSec))
        return res.status(429).json({ message: `密码错误次数过多，请 ${Math.ceil(waitSec / 60)} 分钟后再试` })
      }
      // 交给路由在鉴权失败时调用
      req.recordLoginFailure = () => attempts.set(req.ip, (attempts.get(req.ip) || []).concat(Date.now()))
      next()
    },
    reset(ip) {
      attempts.delete(ip)
    },
    // 便于测试与排查
    stats: () => [...attempts.entries()].map(([ip, arr]) => ({ ip, fails: arr.length }))
  }
}
