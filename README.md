# 世界线存档 · Worldline Archive

记录那些值得被收藏的世界线：BGM、动漫、电影、剧集、漫画、壁纸、随笔与代码笔记。

## 项目结构（monorepo）

```
worldline-archive/
├── web/      # 前端：Vue3 + Vite + Element Plus + Pinia + Vue Router
└── server/   # 后端：Node.js + Express + 本地 JSON 文件存储
```

## 快速开始

分别启动前后端：

```bash
# 后端（端口 3000）
cd server
npm install
npm run dev

# 前端（端口 5173）
cd web
npm install
npm run dev
```

前端默认使用 mock 数据，无需后端即可预览；联调后端时把 `web/.env` 中的
`VITE_USE_MOCK` 改为 `false`。

详见各子项目 README：[web](./web/README.md) · [server](./server/README.md)。

## 内容分类

1. BGM & 好听音乐收藏
2. 动漫
3. 电影
4. 电视剧
5. 漫画
6. 壁纸美图
7. 日常随笔
8. 代码分析笔记
