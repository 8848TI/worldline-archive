import { defineStore } from 'pinia'

const STORAGE_KEY = 'worldline-theme'

// 主题状态：深色为默认，切换时写入 localStorage 并同步 <html data-theme>。
// 页面只引用语义 CSS 变量（--bg / --text / --surface ...），无需感知当前主题。
export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: localStorage.getItem(STORAGE_KEY) || 'dark'
  }),
  getters: {
    isDark: (state) => state.mode === 'dark'
  },
  actions: {
    apply() {
      const root = document.documentElement
      // 切换期间加过渡类，让全站背景/文字/描边平滑过渡，避免闪白闪黑
      root.classList.add('theme-switching')
      root.setAttribute('data-theme', this.mode)
      // 同步 Element Plus 暗色模式（html.dark 触发其内置暗色变量）
      root.classList.toggle('dark', this.isDark)
      localStorage.setItem(STORAGE_KEY, this.mode)
      setTimeout(() => root.classList.remove('theme-switching'), 350)
    },
    toggle() {
      this.mode = this.isDark ? 'light' : 'dark'
      this.apply()
    },
    setMode(mode) {
      this.mode = mode === 'dark' ? 'dark' : 'light'
      this.apply()
    }
  }
})
