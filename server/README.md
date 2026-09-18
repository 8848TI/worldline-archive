# 世界线存档 · 后端 (server)

Node.js + Express，使用本地 JSON 文件存储，方便后期迁移数据库。

## 启动

```bash
cd server
npm install
npm run dev     # 开发模式（node --watch，改动自动重启），端口 3000
# 或
npm start       # 直接运行
```

启动后：

- 健康检查：<http://localhost:3000/>
- 接口清单：<http://localhost:3000/api/docs>
- 接口文档：[docs/API.md](./docs/API.md)

## 目录结构

```
server/
├── app.js              # 入口：中间件、路由挂载、错误处理
├── routes/             # 各资源路由（content/music/wallpapers/tags/timeline/upload/docs）
├── utils/storage.js    # JSON 文件存储层（迁移数据库时只需替换此模块）
├── data/               # 种子数据（content.json / music.json）
├── uploads/            # 上传图片的本地存储目录
└── docs/API.md         # 接口文档
```

## 鉴权（后台写接口）

后台相关的写接口需要登录：

1. `POST /api/auth/login` 提交 `{ username, password }`，默认账号 **root / 123456**；
2. 之后的请求带上请求头 `Authorization: Bearer <token>`；
3. token 默认 7 天有效。

需要鉴权的接口：`POST/PUT/DELETE /api/content`、`POST /api/upload`、`POST /api/upload/video`、
`POST/DELETE /api/tag-categories`、`PUT /api/settings`。只读接口无需鉴权。

**可用环境变量覆盖（部署前请务必设置）：**

| 变量 | 默认值 | 说明 |
|---|---|---|
| `ADMIN_USER` | `root` | 后台账号 |
| `ADMIN_PASS` | `123456` | 后台密码 |
| `ADMIN_SECRET` | 内置默认值 | token 签名密钥，**公网部署必须改** |
| `ADMIN_TOKEN_TTL` | `604800000` | token 有效期（毫秒） |

## 说明

- 数据文件：`data/content.json`（文章/媒体/壁纸）与 `data/music.json`（音乐）。
- 跨域已通过 `cors` 全局开启。
- 上传的图片保存在 `uploads/`，通过 `/uploads/*` 静态访问。
- 前后端接口字段严格对齐，前端 `web/src/api` 直接对接。
