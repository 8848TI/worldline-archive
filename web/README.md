# 世界线存档 · 前端 (web)

Vue3 + Vite + Element Plus + Pinia + Vue Router。

## 启动

```bash
cd web
npm install
npm run dev      # 开发服务器，端口 5173
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

## 环境变量（`web/.env`）

| 变量 | 说明 |
|---|---|
| `VITE_USE_MOCK` | `true` = 不依赖后端、走本地 mock 数据；`false` = 走真实接口 |
| `VITE_API_BASE` | 接口基地址，默认 `/api`（开发态由 vite 代理到 `http://localhost:3000`） |

- mock 数据是**动态加载**的：`VITE_USE_MOCK=false` 时那份演示数据不会进生产包（构建期被剔除）。
- `VITE_USE_MOCK` 缺省值为 `true`（没写这个变量时会走 mock），所以 `web/.env` 需要提交。
- **改 `vite.config.js` 或 `.env` 后必须重启 dev server**，热更新不会重新读取。

## 目录结构

```
web/src/
├── api/               # axios 封装（统一解包 / 401 处理）+ 各资源接口，字段与后端对齐
├── mock/              # mock 数据与适配器（仅 mock 模式动态加载）
├── stores/            # Pinia：theme（主题）、player（全局播放器队列与状态）
├── router/            # 路由配置（含 /admin 登录守卫、按页设置 title）
├── components/
│   ├── layout/        # AppHeader / HeroBanner / AudioEngine / AppFooter
│   ├── home/          # 首页侧栏卡片（音乐播放卡片等）
│   ├── common/        # 卡片、筛选、空状态等通用组件
│   └── admin/         # 后台 8 个管理模块 + Markdown 编辑器 + 两级标签选择
├── views/             # 页面：首页/分类/文娱集/音乐/壁纸/时间线/文章/说说/项目/工具/后台
├── composables/       # 组合式函数（统一内容跳转、分页）
├── constants/         # 分类常量（新增分类在此追加）
├── utils/             # 格式化、markdown 渲染、缩略图地址、音频单例
└── styles/            # 主题变量 + 基础样式
```

## 几个关键实现

**Element Plus 按需引入**（`vite.config.js`）
用 `unplugin-vue-components` + 自定义解析器，把模板里的 `<el-button>` 解析成
`element-plus/es/components/button/index` 这种深路径导入 + 对应样式。
*为什么不直接用官方 `ElementPlusResolver`*：它生成的是包根导入（`element-plus/es`），
而组件入口在模块顶层有副作用赋值（`xxx.install = ...`），Rollup 摇不掉，实测会把
124 个组件里的 101 个打进来（798KB）。换成深路径后只保留真正用到的十几个（256KB）。

> 新增 Element Plus 组件时不用手动注册，模板里写 `<el-xxx>` 即可；但如果用了新的**命令式 API**
> （类似 `ElMessage`），记得从 `element-plus/es/components/...` 引入，并在 `main.js` 补上它的样式。

**三栏常驻外壳**（`App.vue`）
左中右三栏（自我介绍/公告/天气/分类/标签 · 内容区 · 统计/音乐/日历）常驻，切换导航只替换中栏内容，
配合顶部的背景横幅，页面切换时不会整页重排。

**全局播放器**
`utils/audio.js` 是全局唯一的 `<audio>` 单例，`components/layout/AudioEngine.vue` 负责把 store 状态同步到它，
所以切页面不会中断播放。UI 是首页右栏的卡片 + 播放列表抽屉。
队列与当前曲目会记在 `localStorage`，刷新后恢复并保持暂停态（**不恢复具体秒数**，点播放从 0 开始）。

**缩略图**
上传的图片由后端生成缩略图，命名约定 `<原名>.thumb.webp`，前端用 `utils/imageUrl.js` 的 `thumbUrl()` 拼接；
列表/网格用缩略图、点开预览用原图，取不到缩略图会自动退回原图。

**主题**：深色为默认，通过 `data-theme` 与 Element Plus 的 `dark` 类双轨切换，已持久化到 localStorage。

## 构建体积参考

`npm run build` 后的量级（用于回归对比，明显变大就说明有依赖被整包打进来了）：

| 产物 | 大小 |
|---|---|
| `element-plus-*.js` | ≈ 256 KB（gzip ≈ 82 KB） |
| `vue-*.js` | ≈ 116 KB |
| `vendor-*.js` | ≈ 177 KB |
| `index-*.js`（应用入口） | ≈ 34 KB |
| CSS 合计 | ≈ 180 KB |

## 说明

- 响应式：桌面 / 平板 / 手机自适应。
- 主题切换、全局播放、时间线归档均为原站交互思路的重新实现，未复制任何参考站源码。
