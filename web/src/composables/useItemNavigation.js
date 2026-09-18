import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { ARTICLE_TYPES } from '@/constants/categories'

// 统一的「内容条目点击跳转」逻辑，首页 / 时间线 / 标签页共用。
// 文章 → 详情页；音乐 → 直接播放；壁纸 → 壁纸页；媒体 → 分类页；项目/工具 → 外链。
export function useItemNavigation() {
  const router = useRouter()
  const player = usePlayerStore()

  function openItem(item) {
    if (!item) return
    if (ARTICLE_TYPES.includes(item.type)) {
      router.push(`/article/${item.id}`)
    } else if (item.type === 'music') {
      player.playList([item])
    } else if (item.type === 'wallpaper') {
      router.push('/wallpaper')
    } else if (item.type === 'project') {
      const url = item.ext?.project?.url
      if (url) window.open(url, '_blank', 'noopener')
    } else if (item.type === 'tool') {
      const url = item.ext?.tool?.url
      if (url) window.open(url, '_blank', 'noopener')
    } else {
      router.push(`/category/${item.type}`)
    }
  }

  return { openItem }
}
