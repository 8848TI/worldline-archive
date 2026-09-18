import { defineStore } from 'pinia'
import { fetchSettings, updateSettings } from '@/api/settings'
import { site as siteConfig } from '@/config/site'

// 站点运行时设置：以 config/site.js 为默认值，启动后从后端设置接口覆盖。
// 目前用于首页横幅视频，后续可扩展到更多可配置项。
export const useSiteStore = defineStore('site', {
  state: () => ({
    hero: { ...siteConfig.hero },
    loaded: false
  }),
  actions: {
    async load() {
      try {
        const data = await fetchSettings()
        if (data?.hero) this.hero = { ...this.hero, ...data.hero }
      } catch (e) {
        /* 接口失败时用默认配置 */
      }
      this.loaded = true
    },
    // 保存横幅设置并同步到本地状态
    async saveHero(hero) {
      const data = await updateSettings({ hero: { ...this.hero, ...hero } })
      if (data?.hero) this.hero = data.hero
      return data
    }
  }
})
