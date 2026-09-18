import { defineStore } from 'pinia'

// 文章筛选状态：侧栏的「文章分类 / 文章标签」点击后，由中间文章列表消费。
export const useFilterStore = defineStore('filter', {
  state: () => ({
    category: '',
    tag: '',
    keyword: ''
  }),
  actions: {
    toggleCategory(key) {
      this.category = this.category === key ? '' : key
    },
    toggleTag(tag) {
      this.tag = this.tag === tag ? '' : tag
    },
    setKeyword(kw) {
      this.keyword = kw || ''
    },
    clear() {
      this.category = ''
      this.tag = ''
      this.keyword = ''
    }
  }
})
