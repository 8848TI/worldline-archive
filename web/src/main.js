import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'
import icons from './plugins/icons'

import './styles/index.css'

const app = createApp(App)

// 按需注册图标（见 plugins/icons.js），避免打包整个图标库
app.use(icons)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
