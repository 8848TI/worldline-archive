# 世界线存档 API 文档

- 基础地址：`http://localhost:3000`
- 数据格式：所有接口返回 JSON，字段与前端 `web/src/api` 完全对齐。
- 通用约定：成功返回原始数据（对象或 `{ list, total, ... }`）；失败返回 `{ message }` 并配合对应 HTTP 状态码。
- 静态资源：上传的文件通过 `/uploads/*` 访问，接口里存的是**相对地址**（如 `/uploads/xxx.webp`）。

## 鉴权说明

后台相关的**写接口**需要登录。流程：

1. `POST /api/auth/login` 提交 `{ username, password }`，拿到 `token`。
   账号密码取自 `server/.env`（代码内兜底为 `root` / `123456`），**部署前务必改掉**；
2. 后续请求带上请求头 `Authorization: Bearer <token>`；
3. token 默认 7 天有效（`ADMIN_TOKEN_TTL`），过期或非法返回 `401 { message: '未登录或登录已过期，请重新登录' }`；
4. 改 `ADMIN_SECRET` 会让所有已签发的 token 立即失效。

**登录限流**：同一 IP 连续失败 5 次锁定 10 分钟（登录成功即清零），期间返回
`429 { message: '密码错误次数过多，请 N 分钟后再试' }`，并带 `Retry-After` 头。

账号密码与密钥可用环境变量覆盖：`ADMIN_USER` / `ADMIN_PASS` / `ADMIN_SECRET` / `ADMIN_TOKEN_TTL`。
**部署到公网前请务必设置 `ADMIN_SECRET`（否则使用源码里的默认密钥）并修改默认密码。**

| 需要登录的接口 |
|---|
| `POST/PUT/DELETE /api/content` · `POST /api/upload` · `POST /api/upload/video` · `POST /api/upload/audio` |
| `POST/DELETE /api/tag-categories` · `PUT /api/settings` · `GET /api/auth/check` |

只读接口（`GET /api/content`、`/api/music`、`/api/wallpapers`、`/api/tags`、`/api/timeline`、`/api/settings`、`/api/tag-categories`）无需鉴权。

## 统一内容模型 Content

```jsonc
{
  "id": "c1",                 // 唯一 ID
  "type": "code",             // essay|code|anime|movie|drama|manga|wallpaper|project|tool|music
  "title": "标题",
  "summary": "简介",
  "cover": "",                // 封面图 URL（可为空，前端用色块占位）
  "tags": ["Vue", "前端"],     // 标签数组（归档）
  "createdAt": "2026-09-08T10:30:00.000Z",
  "updatedAt": "2026-09-08T10:30:00.000Z",
  "ext": {                    // 按类型扩展（可空）
    "music":    { "artist": "", "album": "", "audioUrl": "", "duration": 0 },
    "media":    { "rating": 0, "year": 0, "status": "", "episodes": null },
    "wallpaper":{ "images": [ { "url": "", "width": 0, "height": 0, "title": "" } ] },
    "article":  { "content": "markdown 正文", "images": [], "wordCount": 0 },
    "project":  { "url": "" },
    "tool":     { "url": "" }
  }
}
```

## 接口列表

### 1. 统一内容列表
`GET /api/content`

| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 分类 key，可选 |
| tag | string | 按标签筛选，可选 |
| keyword | string | 模糊搜索：标题、简介、**正文**、音乐作者/专辑，可选 |
| sort | string | `newest`（默认）\| `rating` \| `oldest` |
| page | number | 页码，默认 1 |
| pageSize | number | 每页条数，默认 12，最大 50 |

返回：`{ list: Content[], total, page, pageSize }`

### 2. 内容详情
`GET /api/content/:id`

返回：单个 `Content`（含 markdown 正文）。不存在时返回 404。

### 3. 新增内容
`POST /api/content`（需登录）

请求体（JSON）：`{ type, title, summary?, cover?, tags?, ext? }`

- `title` 必填，其余可选；`type=music` 写入 `musics` 表，其余类型写入 `contents` 表；
- 自动生成 `id`、`createdAt`、`updatedAt`；
- 支持的类型：`essay` `code` `project` `tool` `anime` `movie` `drama` `manga` `wallpaper` `music`。

**入参校验**（不通过返回 `400 { message }`）：

| 字段 | 约束 |
|---|---|
| `type` | 必须是上面列出的类型之一 |
| `title` | 长度 ≤ 200 |
| `summary` | 长度 ≤ 2000 |
| `cover` | 长度 ≤ 500 |
| `tags` | 数组，≤ 30 项，每项 1-50 字的字符串 |
| `ext` | 必须是对象；`ext.music.audioUrl` 长度 ≤ 1000 |

### 4. 修改内容
`PUT /api/content/:id`（需登录）—— 请求体字段同新增（只传需要改的字段），校验规则同上但允许部分字段；返回更新后的对象。

### 5. 删除内容
`DELETE /api/content/:id`（需登录）—— 返回 `{ ok: true, id }`。
删除时会顺带清理**只被这条内容引用**的上传文件（含缩略图），共用文件不会删。

### 6. 两级标签体系
- `GET /api/tag-categories` —— 返回 `{ list: [{ name, children: [] }] }`
- `POST /api/tag-categories`（需登录）—— 新增大类或子小类
  - 新增大类：`{ "name": "新大类" }`
  - 新增子小类：`{ "parent": "动漫", "name": "新子类" }`
  - 返回更新后的完整 `{ list }`；名称为空或超过 30 字返回 400
- `DELETE /api/tag-categories?name=xxx`（需登录）—— 删除大类
- `DELETE /api/tag-categories?parent=xxx&name=yyy`（需登录）—— 删除子小类

### 7. 音乐列表
`GET /api/music`

| 参数 | 说明 |
|------|------|
| keyword | 歌名/歌手/专辑模糊搜索，可选 |

返回：`{ list: Music[], total }`

### 8. 单曲详情
`GET /api/music/:id` — 返回单个 Music 对象。

### 9. 壁纸图片列表
`GET /api/wallpapers` — 返回 `{ list: WallpaperImage[], total }`，每条为：

```jsonc
{ "id": "", "parentId": "", "title": "", "url": "", "width": 0, "height": 0, "tags": [], "createdAt": "" }
```

### 10. 标签聚合
`GET /api/tags` — 返回 `{ list: [{ name, count }], total }`，按出现次数降序。

### 11. 时间线
`GET /api/timeline`

| 参数 | 说明 |
|------|------|
| year | 按年份筛选，可选 |

返回：`{ groups: [{ date, items: Content[] }], years: number[], total }`，按日期倒序。

### 12. 站点设置
- `GET /api/settings` —— 返回 `{ hero: { mode, video, image, images, interval } }`
- `PUT /api/settings`（需登录）—— 浅合并，只传要改的字段；非对象返回 400

### 13. 图片上传
`POST /api/upload`（需登录，`multipart/form-data`，字段名 `file`）

限制：10MB 以内，支持 `jpg / png / webp / gif / svg`。

处理：超过 1920px 或 300KB 的图会转成 webp（质量 82），并**始终**额外生成一张 480px 宽的缩略图；
`svg`（矢量）与 `gif`（动画）原样保留、不生成缩略图。

返回：

```jsonc
{
  "url": "/uploads/xxx.webp",          // 相对地址，可直接用
  "thumb": "/uploads/xxx.thumb.webp",  // 缩略图（列表/网格用）；null 表示没有
  "filename": "xxx.webp",
  "size": 12345,
  "mimetype": "image/webp",
  "kind": "image"
}
```

缩略图命名约定：`<原名去扩展名>.thumb.webp`，前端用 `web/src/utils/imageUrl.js` 的 `thumbUrl()` 拼接。

### 14. 视频 / 音频上传
- `POST /api/upload/video`（需登录）—— 30MB 以内，`mp4 / webm / ogg / mov`
- `POST /api/upload/audio`（需登录）—— 30MB 以内，`mp3 / wav / ogg / m4a / flac / aac`
- 返回结构同图片，但无 `thumb`

### 15. 登录与校验
- `POST /api/auth/login` —— `{ username, password }` → `{ token, username }`
- `GET /api/auth/check`（需登录）—— 校验 token，返回 `{ ok: true, username }`

## SEO / 订阅（非 `/api` 前缀）

| 路径 | 说明 |
|---|---|
| `GET /sitemap.xml` | 站点地图（静态页面 + 全部内容条目） |
| `GET /rss.xml` | RSS 2.0，最新 30 条 |
| `GET /article/:id` | 返回**注入了逐篇 meta 的 HTML**（`og:title` / `og:description` / `og:image` / `og:url` / `twitter:card` / `canonical`），供分享卡片与爬虫使用；需先 `cd web && npm run build` 生成 `web/dist` |

## 运行

```bash
cd server
npm install
npm run dev   # node --watch-path（只监视代码目录），端口 3000
```
