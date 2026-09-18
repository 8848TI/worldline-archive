# 世界线存档 · Worldline Archive

记录那些值得被收藏的世界线：BGM、动漫、电影、剧集、漫画、壁纸、随笔与代码笔记。

## 项目结构（monorepo）

```
worldline-archive/
├── web/      # 前端：Vue3 + Vite + Element Plus + Pinia + Vue Router
└── server/   # 后端：Node.js + Express + SQLite（node-sqlite3-wasm，无需本地编译）
```

## 快速开始

分别启动前后端：

```bash
# 后端（端口 3000）
cd server
npm install
cp .env.example .env    # 首次：填后台账号、密码与 token 签名密钥（.env 不会被提交）
npm run db:init         # 首次：创建 SQLite 库文件与表结构
npm run db:migrate      # 首次（可选）：把 data/*.json 里的数据导入库
npm run dev

# 前端（端口 5173）
cd web
npm install
npm run dev
```

前端默认使用 mock 数据，无需后端即可预览；联调后端时把 `web/.env` 中的
`VITE_USE_MOCK` 改为 `false`（关闭后 mock 数据不会进生产包，构建时会被剔除）。

详见各子项目 README：[web](./web/README.md) · [server](./server/README.md) ·
部署上线见 [docs/DEPLOY.md](./docs/DEPLOY.md)。

## 后端常用命令

在 `server/` 目录下执行：

```bash
npm run dev              # 开发模式（node --watch-path，只监视代码目录）
npm start                # 生产运行
npm run db:init          # 建库建表（幂等，可重复执行）
npm run db:migrate       # 从 data/*.json 导入数据（按 id 覆盖）
npm run db:backup        # 热备份数据库（VACUUM INTO + 校验 + 轮转）
npm run db:export        # 把库导回 data/*.json（版本库里的内容存档）
npm run archive          # 导出 + 提交 + 推送（定时任务用，见 docs/DEPLOY.md）
npm run sync:media       # 把 uploads/ 增量同步到异地目录（需配 MEDIA_SYNC_TARGET）
npm run images:thumbs    # 给已有图片补缩略图
npm run images:optimize  # 压缩历史大图并自动改写数据库里的引用
npm run smoke            # 冒烟测试：只读接口 / 鉴权 / 增改删 / 校验 / SEO
```

## 备份与存档

要保住的东西就三样，都有现成命令（在 `server/` 下跑）：

| 内容 | 命令 | 说明 |
|---|---|---|
| 文字内容 | `npm run archive` | 导出 `data/*.json` → 提交 → 推送，给定时任务用 |
| 媒体文件 | `npm run sync:media` | 把 `uploads/` 增量同步到异地目录（需配 `MEDIA_SYNC_TARGET`） |
| 数据库 | `npm run db:backup` | 热备份 + 校验行数 + 按份数轮转 |

**「JSON 存档（git）+ uploads 异地副本」合起来就是一份完整可恢复的备份**：
换机器时 `npm ci` → `npm run db:migrate` → 把媒体目录拷回 `uploads/`，站点就回来了。
定时任务怎么挂见 [docs/DEPLOY.md](./docs/DEPLOY.md) 第 5 节。

## 文档

- [docs/DEPLOY.md](./docs/DEPLOY.md) —— 部署上线：nginx、进程守护、定时备份、对象存储、HTTPS、常见问题
- [server/docs/API.md](./server/docs/API.md) —— 接口文档
- [server/README.md](./server/README.md) —— 后端：数据存储、备份存档、鉴权、环境变量
- [web/README.md](./web/README.md) —— 前端：按需引入、播放器、缩略图、构建体积基线

## 内容分类

1. BGM & 好听音乐收藏
2. 动漫
3. 电影
4. 电视剧
5. 漫画
6. 壁纸美图
7. 日常随笔
8. 代码分析笔记
