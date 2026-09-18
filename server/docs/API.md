# 世界线存档 API 文档

- 基础地址：`http://localhost:3000`
- 数据格式：所有接口返回 JSON，字段与前端 `web/src/api` 完全对齐。
- 通用约定：成功返回原始数据（对象或 `{ list, total, ... }`）；失败返回 `{ message }` 并配合对应 HTTP 状态码。

## 鉴权说明

后台相关的**写接口**需要登录。流程：

1. `POST /api/auth/login` 提交 `{ username, password }`（默认 `root` / `123456`），拿到 `token`；
2. 后续请求带上请求头 `Authorization: Bearer <token>`；
3. token 默认 7 天有效，过期或非法返回 `401 { message: '未登录或登录已过期，请重新登录' }`。

账号密码与密钥可用环境变量覆盖：`ADMIN_USER` / `ADMIN_PASS` / `ADMIN_SECRET` / `ADMIN_TOKEN_TTL`。
**部署到公网前请务必设置 `ADMIN_SECRET`（否则使用默认密钥）并修改默认密码。**

| 需要登录的接口 |
|---|
| `POST/PUT/DELETE /api/content` · `POST /api/upload` · `POST /api/upload/video` |
| `POST/DELETE /api/tag-categories` · `PUT /api/settings` · `GET /api/auth/check` |

只读接口（`GET /api/content`、`/api/music`、`/api/wallpapers`、`/api/tags`、`/api/timeline`、`/api/settings`、`/api/tag-categories`）无需鉴权。

## 统一内容模型 Content

```jsonc
{
  "id": "c1",                 // 唯一 ID
  "type": "code",             // 分类: music|anime|movie|drama|manga|wallpaper|essay|code
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
    "article":  { "content": "markdown 正文", "wordCount": 0 }
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
| keyword | string | 标题/简介模糊搜索，可选 |
| sort | string | `newest`（默认）\| `rating` \| `oldest` |
| page | number | 页码，默认 1 |
| pageSize | number | 每页条数，默认 12，最大 50 |

返回：`{ list: Content[], total, page, pageSize }`

### 2. 内容详情
`GET /api/content/:id`

返回：单个 `Content`（含 markdown 正文）。不存在时返回 404。

### 3. 新增内容
`POST /api/content`

请求体（JSON）：`{ type, title, summary?, cover?, tags?, ext? }`

- `title` 必填，其余可选；`type=music` 时写入 `music.json`，其余类型写入 `content.json`；
- 自动生成 `id`、`createdAt`、`updatedAt`。
- 支持的类型：`essay` `code` `project` `tool` `anime` `movie` `drama` `manga` `wallpaper` `music`

返回：新建后的完整对象。

### 4. 修改内容
`PUT /api/content/:id` —— 请求体字段同新增（只传需要改的字段即可），返回更新后的对象。

### 5. 删除内容
`DELETE /api/content/:id` —— 返回 `{ ok: true, id }`。

### 6. 两级标签体系
- `GET /api/tag-categories` —— 返回 `{ list: [{ name, children: [] }] }`
- `POST /api/tag-categories` —— 新增大类或子小类
  - 新增大类：`{ "name": "新大类" }`
  - 新增子小类：`{ "parent": "动漫", "name": "新子类" }`
  - 返回更新后的完整 `{ list }`

### 7. 音乐列表
`GET /api/music`

| 参数 | 说明 |
|------|------|
| keyword | 歌名/歌手/专辑模糊搜索，可选 |

返回：`{ list: Music[], total }`

### 4. 单曲详情
`GET /api/music/:id` — 返回单个 Music 对象。

### 5. 壁纸图片列表
`GET /api/wallpapers` — 返回 `{ list: WallpaperImage[], total }`，每条为：

```jsonc
{ "id": "", "parentId": "", "title": "", "url": "", "width": 0, "height": 0, "tags": [], "createdAt": "" }
```

### 6. 标签聚合
`GET /api/tags` — 返回 `{ list: [{ name, count }], total }`，按出现次数降序。

### 7. 时间线
`GET /api/timeline`

| 参数 | 说明 |
|------|------|
| year | 按年份筛选，可选 |

返回：`{ groups: [{ date, items: Content[] }], years: number[], total }`，按日期倒序。

### 8. 图片上传
`POST /api/upload`（`multipart/form-data`，字段名 `file`）

限制：10MB 以内，支持 `jpg / png / webp / gif / svg`。
返回：`{ url, filename, size, mimetype }`，其中 `url` 可直接访问。

## 运行

```bash
cd server
npm install
npm run dev   # node --watch app.js，端口 3000
```
