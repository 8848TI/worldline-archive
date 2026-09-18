// 写接口的基础入参校验：只挡明显不合理的输入（超长、类型错、枚举非法），
// 不做业务级校验。返回错误提示字符串表示不合法，返回 null 表示通过。

export const CONTENT_TYPES = ['essay', 'code', 'anime', 'movie', 'drama', 'manga', 'wallpaper', 'project', 'tool', 'music']

const LIMITS = {
  title: 200,
  summary: 2000,
  cover: 500,
  tags: 30, // 标签个数
  tagLen: 50, // 单个标签长度
  url: 1000
}

export function validateContent(body, { partial = false } = {}) {
  const b = body || {}

  // type：新建必填，更新时若传了必须合法
  if (!partial || b.type !== undefined) {
    if (!b.type) return 'type 不能为空'
    if (!CONTENT_TYPES.includes(b.type)) return `type 不合法，可选：${CONTENT_TYPES.join(' / ')}`
  }

  if (!partial) {
    if (typeof b.title !== 'string' || !b.title.trim()) return 'title 不能为空'
  }
  if (b.title !== undefined && (typeof b.title !== 'string' || b.title.length > LIMITS.title)) {
    return `title 必须是 ${LIMITS.title} 字以内的字符串`
  }
  if (b.summary !== undefined && (typeof b.summary !== 'string' || b.summary.length > LIMITS.summary)) {
    return `summary 必须是 ${LIMITS.summary} 字以内的字符串`
  }
  if (b.cover !== undefined && (typeof b.cover !== 'string' || b.cover.length > LIMITS.cover)) {
    return `cover 必须是 ${LIMITS.cover} 字以内的字符串`
  }
  if (b.tags !== undefined) {
    if (!Array.isArray(b.tags) || b.tags.length > LIMITS.tags) return `tags 必须是最多 ${LIMITS.tags} 项的数组`
    if (!b.tags.every((t) => typeof t === 'string' && t.length > 0 && t.length <= LIMITS.tagLen)) {
      return `每个标签必须是 1-${LIMITS.tagLen} 字的字符串`
    }
  }
  if (b.ext !== undefined && (typeof b.ext !== 'object' || b.ext === null || Array.isArray(b.ext))) {
    return 'ext 必须是对象'
  }
  // 音乐类型的音频地址
  const audioUrl = b.ext?.music?.audioUrl
  if (audioUrl !== undefined && (typeof audioUrl !== 'string' || audioUrl.length > LIMITS.url)) {
    return `音频地址必须是 ${LIMITS.url} 字以内的字符串`
  }

  return null
}

// 标签大类 / 子类
export function validateTagCategory(body) {
  const name = String(body?.name ?? '').trim()
  if (!name) return '名称不能为空'
  if (name.length > 30) return '名称不能超过 30 个字'
  return null
}

// 站点设置：只做结构校验（必须是对象）
export function validateSettings(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return '设置内容必须是对象'
  return null
}
