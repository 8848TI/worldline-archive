# 世界线存档 · 前端 (web)

Vue3 + Vite + Element Plus + Pinia + Vue Router。

## 启动

```bash
cd web
npm install
npm run dev     # 开发服务器，端口 5173
```

默认使用 **mock 数据**（`VITE_USE_MOCK=true`），无需后端即可预览全部页面。

联调后端时，在 `web/.env` 中把 `VITE_USE_MOCK` 改为 `false`，开发服务器会自动把
`/api` 与 `/uploads` 代理到 `http://localhost:3000`（见 `vite.config.js`）。

## 目录结构

```
web/src/
├── api/               # axios 封装 + 各资源接口（与后端字段对齐）
├── mock/              # mock 数据与适配器（关闭后自动走真实接口）
├── stores/            # Pinia：theme（主题）、player（全局播放器）
├── router/            # 路由配置
├── components/        # layout（导航/页脚/播放器）+ common（卡片/筛选等）
├── views/             # 页面：首页/分类/音乐/壁纸/时间线/文章/标签/404
├── composables/       # 组合式函数（统一内容跳转等）
├── constants/         # 分类常量（新增分类在此追加）
├── utils/             # 格式化、markdown 渲染
└── styles/            # 主题变量 + 基础样式
```

## 说明

- 主题：深色为默认，通过 `data-theme` 与 Element Plus `dark` 类双轨切换，已持久化。
- 全局播放器：底部常驻，`stores/player.js` 管理队列与状态，任何页面可接入播放。
- 响应式：桌面 / 平板 / 手机自适应。
- 壁纸与媒体封面使用 picsum 占位图（需联网）；文章封面为空时用「分类色块 + emoji」占位。
