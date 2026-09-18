import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Element Plus 已改为按需引入（见 vite.config.js 的 Components 插件）：
// 模板中用到的 el-* 组件会连同各自样式自动打包；这里只补三块全局样式——
// base（变量与动画）、命令式 API 的样式（消息提示、确认框及其遮罩）、暗色主题变量。
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-overlay.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'
import icons from './plugins/icons'
import request, { USE_MOCK } from './api/request'

import './styles/index.css'

async function bootstrap() {
  // 仅在 mock 模式下动态加载演示数据（约 38KB）：关闭 mock 时不会进包，也不会发起这次加载
  if (USE_MOCK) {
    const { setupMock } = await import('./mock')
    setupMock(request)
  }

  const app = createApp(App)

  // 按需注册图标（见 plugins/icons.js），避免打包整个图标库
  app.use(icons)

  app.use(createPinia())
  app.use(router)
  // 不再 app.use(ElementPlus)：组件由 vite.config.js 的按需插件注入

  app.mount('#app')
}

bootstrap()
