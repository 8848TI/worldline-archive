import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const EP = 'node_modules/element-plus/es/components'

// 例外表：这些组件没有独立入口目录，得从父组件导入
const EP_PARENT = { option: 'select', 'option-group': 'select' }

// 找出组件真正的入口目录（含 index.mjs 的那个）
function entryDir(kebab) {
  if (existsSync(`${EP}/${kebab}/index.mjs`)) return kebab
  const candidates = [EP_PARENT[kebab], kebab.split('-')[0]].filter(Boolean)
  for (const c of candidates) if (existsSync(`${EP}/${c}/index.mjs`)) return c
  return null
}

// Element Plus 按需引入的解析器：把模板里的 <el-button> 解析成
//   import { ElButton } from 'element-plus/es/components/button/index'
//   + import 'element-plus/es/components/button/style/css'
//
// 为什么不用官方的 ElementPlusResolver：它生成的是包根导入（element-plus/es），
// 而那个 barrel 会把全部 124 个组件拉进模块图；组件入口在模块顶层带副作用赋值
// （如 `_MessageBox.install = ...`），Rollup 摇不掉，实测打进了 101 个组件（798KB）。
// 改成深路径导入后只保留真正用到的那十几个。
function ElementPlusDeepResolver(componentName) {
  if (!/^El[A-Z]/.test(componentName)) return
  const kebab = componentName
    .slice(2)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
  const dir = entryDir(kebab)
  if (!dir) return // 交给兜底的官方解析器
  // 样式取自子组件自己的目录（若有）：像 el-radio-button 这类子组件，
  // JS 从父组件 radio 导入，但它的 CSS 在 radio-button/style 下，不能漏。
  const styleDir = existsSync(`${EP}/${kebab}/style/css.mjs`) ? kebab : dir
  return {
    name: componentName,
    from: `element-plus/es/components/${dir}/index`,
    sideEffects: `element-plus/es/components/${styleDir}/style/css`
  }
}

export default defineConfig({
  plugins: [
    vue(),
    // dirs 置空：不自动注册 src/components 下的本地组件，保持现有显式引用方式不变。
    // 兜底保留官方解析器：万一有组件名不符合命名规则，仍能解析（只是会退回 barrel）。
    Components({
      dirs: [],
      resolvers: [ElementPlusDeepResolver, ElementPlusResolver()],
      dts: false
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: false,
    // 联调后端时：将 /api 与 /uploads 代理到本地 Express 服务
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    // 手动分包：把体积大的依赖拆开，首屏更快、缓存更稳定
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('element-plus') || id.includes('@element-plus')) return 'element-plus'
          if (id.includes('highlight.js')) return 'highlight'
          if (id.includes('markdown-it')) return 'markdown'
          if (id.includes('vue') || id.includes('pinia')) return 'vue'
          return 'vendor'
        }
      }
    }
  }
})
