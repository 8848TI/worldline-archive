// 通用格式化工具

// ISO 时间 → 2026-09-16
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 秒 → m:ss（播放器用）
export function formatTime(sec = 0) {
  const s = Math.max(0, Math.floor(Number(sec) || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

// 秒数 → 分钟（文章阅读时长用）
export function formatDuration(sec) {
  const m = Math.max(1, Math.round((Number(sec) || 0) / 60))
  return `${m} 分钟`
}
