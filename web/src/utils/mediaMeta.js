// 读取远端（或本地）/音频文件的时长，失败返回 0。
// 用于老数据 duration 为 0 时的展示补全，以及后台上传/保存时补齐时长。
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

// 读取本地 File 对象的时长（走临时 objectURL，读完即释放）
export async function readDurationFromFile(file) {
  if (!file) return 0
  const url = URL.createObjectURL(file)
  try {
    return await readDurationFromUrl(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}
