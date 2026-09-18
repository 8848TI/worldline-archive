// 读取远端（或本地）/音频文件的时长，失败返回 0。
// 用于老数据 duration 为 0 时的展示补全。
export function readDurationFromUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(0)
    const el = new Audio()
    el.preload = 'metadata'
    let settled = false
    const done = (v) => {
      if (settled) return
      settled = true
      el.removeAttribute('src')
      resolve(v)
    }
    el.onloadedmetadata = () => done(Math.round(el.duration) || 0)
    el.onerror = () => done(0)
    // 超时兜底：个别文件元数据读取可能一直挂起
    setTimeout(() => done(0), 8000)
    el.src = url
  })
}
