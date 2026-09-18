// 全站 8 大内容分类。新增分类只需在此追加一条，其余页面自动适配。
export const CATEGORIES = [
  { key: 'music', label: 'BGM & 音乐', emoji: '🎵', color: '#7FA6D9' },
  { key: 'anime', label: '动漫', emoji: '🍥', color: '#E0A070' },
  { key: 'movie', label: '电影', emoji: '🎬', color: '#A78BC9' },
  { key: 'drama', label: '电视剧', emoji: '📺', color: '#6FB3B8' },
  { key: 'manga', label: '漫画', emoji: '📚', color: '#DE8FA8' },
  { key: 'wallpaper', label: '壁纸美图', emoji: '🖼️', color: '#8FB87E' },
  { key: 'essay', label: '日常随笔', emoji: '✍️', color: '#C9A86A' },
  { key: 'code', label: '代码笔记', emoji: '💻', color: '#7E93B3' },
  { key: 'project', label: '项目', emoji: '📦', color: '#8FA3B8' },
  { key: 'tool', label: '工具箱', emoji: '🧰', color: '#A8A0C0' }
]

// 媒体库页面的子分类（动漫 / 电影 / 剧集 / 漫画）
export const MEDIA_TYPES = ['anime', 'movie', 'drama', 'manga']

// 需要 Markdown 渲染的文章类型
export const ARTICLE_TYPES = ['essay', 'code']

const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))

// 按 key 获取分类；未命中时返回兜底占位，保证新增类型不报错
export function getCategory(key) {
  return categoryMap[key] || { key, label: key || '未分类', emoji: '📄', color: '#8a8a93' }
}
