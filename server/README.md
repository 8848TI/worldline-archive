# 世界线存档 · 后端 (server)

Node.js + Express，数据存 SQLite（`node-sqlite3-wasm`，真 SQLite 的 WebAssembly 构建，无需本地编译）。

## 启动

```bash
cd server
npm install
cp .env.example .env   # 首次：填 ADMIN_USER / ADMIN_PASS / ADMIN_SECRET（.env 已被 gitignore）
npm run db:init        # 首次：创建 data/worldline.db 与表结构（幂等）
npm run db:migrate     # 首次（可选）：把 data/*.json 的数据导入库
npm run dev            # 开发模式（改动代码自动重启），端口 3000
# 或
npm start              # 直接运行
```

启动后：

- 健康检查：<http://localhost:3000/>
- 接口清单：<http://localhost:3000/api/docs>
- 接口文档：[docs/API.md](./docs/API.md)

## 目录结构

```
server/
├── app.js                 # 入口：中间件、路由挂载、错误处理、SPA 静态托管
├── routes/                # 资源路由（content/music/wallpapers/tags/timeline/upload/settings/auth）
│   └── seo.js             # /sitemap.xml、/rss.xml、文章页 meta 注入
├── middleware/
│   ├── requireAuth.js     # 写接口 Bearer token 校验
│   └── rateLimit.js       # 登录失败限流（同 IP 5 次 / 10 分钟）
├── db/
│   ├── index.js           # 打开 SQLite 连接（加载即建表）
│   └── schema.sql         # 表结构：contents / musics / tag_categories / settings / meta
├── scripts/
│   ├── init-db.js         # npm run db:init：建库建表
│   ├── migrate-json-to-sqlite.js   # npm run db:migrate：把 data/*.json 导入库
│   ├── export-db-to-json.js        # npm run db:export：把库导回 data/*.json
│   ├── backup-db.js       # npm run db:backup：热备份 + 校验 + 轮转
│   ├── archive-content.js # npm run archive：导出 + 提交 + 推送（定时任务用）
│   ├── sync-media.js      # npm run sync:media：uploads/ 增量同步到异地目录
│   ├── generate-thumbs.js # npm run images:thumbs：补缩略图
│   ├── optimize-images.js # npm run images:optimize：压历史大图并改写引用
│   └── smoke-test.js      # npm run smoke：接口冒烟测试
├── utils/
│   ├── storage.js         # 存储层：对外只暴露 readXxx 与行级写接口，路由不直接碰数据库
│   ├── mappers.js         # musics → Content 统一结构（/content、/timeline 共用）
│   ├── imageProcess.js    # 上传图片的压缩与缩略图（sharp）
│   ├── uploadFiles.js     # 上传文件的引用收集与安全删除
│   ├── validate.js        # 写接口入参校验
│   ├── auth.js            # token 签发 / 校验
│   ├── env.js             # 加载 server/.env（app.js 第一行引入）
│   └── envFile.js         # 给脚本用的 .env 读取
├── data/
│   ├── worldline.db       # SQLite 库文件（已被 gitignore，需要单独备份）
│   ├── backups/           # db:backup 产出的快照（已被 gitignore）
│   └── *.json             # 内容存档，运行时只读不写（见下）
├── uploads/               # 上传的图片 / 音频 / 视频（已被 gitignore）
└── docs/API.md            # 接口文档
```

## 数据存储

- 运行时就一个库文件：`data/worldline.db`，**备份 = 复制这个文件**（或 `npm run db:backup` 做热备份）。
- `tags`、`ext`（列名 `extra`）、`children`、`value` 这类数组/对象统一存 JSON 字符串，
  接口返回时还原成原字段名（`ext` / `tags` / `createdAt`），前端无感。
- 时间字段一律存 ISO8601 字符串（如 `2026-09-18T01:56:58.894Z`），不要改成数字时间戳，前端排序依赖这个格式。
- 音频 / 视频 / 图片文件本身不进库，只存相对地址 `/uploads/xxx`（换域名、上 HTTPS 都不必改数据）。
- `data/*.json`：运行时**完全不读写**，它们是版本库里的内容存档（`.db` 与 `uploads/` 都被 gitignore）。
  两个方向各一个脚本：`npm run db:migrate` 从 json 导入库（按 id 覆盖、可重复执行），
  `npm run db:export` 把库导回 json。**改了内容记得跑一次 `db:export`**，否则存档会过期，
  下次 `db:migrate` 会把旧数据写回库。
- 删除内容时会顺带清理**只被这条引用**的上传文件（含缩略图）；仍被其他内容共用的文件不会删。
- 上传的图片会自动压缩（超 1920px 或 300KB 转 webp）并生成 480px 缩略图，详见 `utils/imageProcess.js`。

## 备份与存档

整站要保住的东西就三样，都已有现成命令：

| 内容 | 命令 | 说明 |
|---|---|---|
| 文字内容 | `npm run archive` | 导出 `data/*.json` → 提交 → 推送（**定时任务用**，只提交存档文件） |
| 媒体文件 | `npm run sync:media` | 把 `uploads/` 增量同步到异地（需在 `.env` 配 `MEDIA_SYNC_TARGET`） |
| 数据库 | `npm run db:backup` | `VACUUM INTO` 热备份 + 校验 + 按 `BACKUP_KEEP` 轮转 |

- `npm run db:export` = 只导出不提交；`npm run archive -- --no-push` = 导出 + 本地提交、不推送。
- 想换存档推送目标（例如内容进私有仓库、代码仓库保持公开）：`.env` 里设 `ARCHIVE_REMOTE` / `ARCHIVE_BRANCH`。
- **「JSON 存档（git）+ uploads 异地副本」合起来就是一份完整可恢复的备份**：换机器 `npm ci` → `db:migrate` → 媒体拷回 `uploads/`。
- 定时任务怎么挂（crontab / schtasks 命令）见 [../docs/DEPLOY.md](../docs/DEPLOY.md) 第 5 节。

## 鉴权（后台写接口）

后台相关的写接口需要登录：

1. `POST /api/auth/login` 提交 `{ username, password }`（账号密码取自 `server/.env`）；
2. 之后的请求带上请求头 `Authorization: Bearer <token>`；
3. token 默认 7 天有效；改 `ADMIN_SECRET` 会让所有已签发的 token 立即失效。

需要鉴权的接口：`POST/PUT/DELETE /api/content`、`POST /api/upload`、`POST /api/upload/video`、
`POST/DELETE /api/tag-categories`、`PUT /api/settings`。只读接口无需鉴权。

**环境变量（写在 `server/.env`，已被 gitignore 排除；不建也能跑，但会退回下面的兜底默认值）：**

| 变量 | 代码内兜底值 | 说明 |
|---|---|---|
| `ADMIN_USER` | `root` | 后台账号 |
| `ADMIN_PASS` | `123456` | 后台密码 |
| `ADMIN_SECRET` | 内置默认值 | token 签名密钥，**公网部署必须改**（默认值写在源码里，等于谁都能伪造 token） |
| `ADMIN_TOKEN_TTL` | `604800000` | token 有效期（毫秒） |
| `PORT` | `3000` | 服务端口 |
| `DB_FILE` | `data/worldline.db` | 数据库文件位置 |
| `CORS_ORIGINS` | 空（全开） | 逗号分隔的来源白名单，如 `https://blog.example.com` |
| `SITE_NAME` / `SITE_DESC` / `SITE_KEYWORDS` | 内置 | RSS 与分享卡片用的站点信息 |
| `WEB_DIST` | `../web/dist` | 前端构建产物目录 |
| `IMAGE_MAX_WIDTH` / `IMAGE_THUMB_WIDTH` | `1920` / `480` | 上传图片的压缩宽度上限 / 缩略图宽度 |
| `BACKUP_KEEP` | `14` | 数据库备份保留份数 |
| `MEDIA_SYNC_TARGET` | 空 | `sync:media` 的目标目录（不填该命令会提示退出） |
| `MEDIA_SYNC_DIRS` / `MEDIA_SYNC_DELETE` | `uploads` / `false` | 同步哪些目录 / 是否删除目标端多余文件 |
| `ARCHIVE_REMOTE` / `ARCHIVE_BRANCH` | `origin` / 当前分支 | `archive` 推送目标 |

改完 `.env` 需要手动重启后端（`.env` 不在 `--watch-path` 的监视范围内）。

## 说明

- 跨域默认全开；`CORS_ORIGINS` 配了就只放行列出的来源。
- 上传的文件保存在 `uploads/`，通过 `/uploads/*` 静态访问。
- 除 `/api/*` 外还提供 `/sitemap.xml`、`/rss.xml`，以及注入了分享卡片 meta 的 `/article/:id`（见 `routes/seo.js`）。
- 写接口有基础入参校验（`utils/validate.js`），登录接口有失败限流（`middleware/rateLimit.js`）。
- 前后端接口字段严格对齐，前端 `web/src/api` 直接对接。
