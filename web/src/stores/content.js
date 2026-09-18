import { defineStore } from 'pinia'
import { fetchContentList } from '@/api/content'

// 全局内容数据：侧栏统计/分类/标签与中间文章列表共用同一份数据，
// 只拉取一次，避免各组件重复请求。
export const useContentStore = defineStore('content', {
  state: () => ({
    all: [], // 全部内容（含 music 映射）
    loading: false,
    loaded: false
  }),
  actions: {
    // force=true 时强制重新拉取（后台新增/修改内容后回到博客时用）
    async load(force = false) {
      if (this.loading) return
      if (this.loaded && !force) return
      this.loading = true
      try {
        const data = await fetchContentList({ pageSize: 50 })
        this.all = data.list
        this.loaded = true
      } finally {
        this.loading = false
      }
    }
  }
})
