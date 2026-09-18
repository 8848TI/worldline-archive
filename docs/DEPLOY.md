# 部署指南

面向单机部署（一台 VPS + nginx），也适用于容器/多机（差异处会标注）。

## 0. 需要什么

- **Node.js ≥ 20.12**（`utils/env.js` 用到 `process.loadEnvFile`；低版本会退化为读系统环境变量）
- **nginx**（反向代理 + 静态文件 + HTTPS）
- 磁盘：数据库很小（几十 KB 级），媒体文件按你的收藏量算

## 1. 首次部署

```bash
git clone <你的仓库> /srv/worldline-archive
cd /srv/worldline-archive

# 后端
cd server
npm ci
cp .env.example .env          # 然后编辑：ADMIN_USER / ADMIN_PASS / ADMIN_SECRET 三项必改
npm run db:init               # 建库建表
npm run db:migrate            # 把 data/*.json 的旧数据导入库（没有旧数据可跳过）
npm run smoke                 # 可选：确认接口都正常（需先 npm run dev 起服务）

# 前端（构建产物由 nginx 或 Node 提供）
cd ../web
npm ci
npm run build                 # 产物在 web/dist
```

## 2. 环境变量（`server/.env`）

| 变量 | 默认 | 说明 |
|---|---|---|
| `ADMIN_USER` | `root` | 后台账号 |
| `ADMIN_PASS` | `123456` | 后台密码，**必须改** |
| `ADMIN_SECRET` | 源码内默认值 | token 签名密钥，**必须改**（默认值是公开的，等于谁都能伪造登录态） |
| `ADMIN_TOKEN_TTL` | `604800000` | 登录有效期（毫秒） |
| `PORT` | `3000` | 服务端口 |
| `DB_FILE` | `data/worldline.db` | 数据库文件位置 |
| `CORS_ORIGINS` | 空（全开） | 逗号分隔的来源白名单，如 `https://blog.example.com` |
| `SITE_NAME` / `SITE_DESC` / `SITE_KEYWORDS` | 内置 | 站点名/描述/关键词，用于 RSS 与分享卡片 |
| `WEB_DIST` | `../web/dist` | 前端构建产物目录 |
| `IMAGE_MAX_WIDTH` | `1920` | 上传图片的宽度上限（超过则压缩） |
| `IMAGE_THUMB_WIDTH` | `480` | 缩略图宽度 |
| `BACKUP_KEEP` | `14` | 备份保留份数 |

> `.env` 不在 `node --watch-path` 的监视范围内，改完要**手动重启**后端。

## 3. 反向代理（nginx）

### 方式 A（推荐）：静态文件交给 nginx，动态请求反代给 Node

```nginx
server {
  listen 80;
  server_name blog.example.com;
  root /srv/worldline-archive/web/dist;
  index index.html;

  # 前端路由回退（SPA）
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 文章页走 Node：为了注入 og:title / og:image，分享出去才有卡片
  location ~ ^/article/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location = /sitemap.xml { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
  location = /rss.xml     { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # 媒体文件：见第 6 节，本地就直出，用对象存储就改写这里
  location /uploads/ {
    alias /srv/worldline-archive/server/uploads/;
    expires 30d;
    add_header Cache-Control "public";
  }

  client_max_body_size 40m;   # 视频上传上限 30MB，留点余量
}
```

### 方式 B：全部交给 Node（`app.js` 已挂 `express.static(web/dist)` + SPA 兜底）

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
client_max_body_size 40m;
```

## 4. 进程守护

**systemd（Linux 推荐）** `/etc/systemd/system/worldline.service`：

```ini
[Unit]
Description=Worldline Archive API
After=network.target

[Service]
WorkingDirectory=/srv/worldline-archive/server
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now worldline
```

**pm2（跨平台省事）**：

```bash
npm i -g pm2
cd server && pm2 start app.js --name worldline && pm2 save && pm2 startup
```

> Windows 上可以用 `nssm` 把 `node app.js` 注册成服务，或直接用计划任务开机启动。

## 5. 定时备份

整站只有两样东西要备份：**`server/data/worldline.db`**（所有内容）和 **`server/uploads/`**（媒体）。

```bash
# Linux crontab：每天 3 点备份
0 3 * * * cd /srv/worldline-archive/server && npm run db:backup >> /var/log/worldline-backup.log 2>&1
```

```powershell
# Windows 计划任务
schtasks /create /tn worldline-backup /tr "cmd /c cd /d E:\code\project\worldline-archive\server && npm run db:backup" /sc daily /st 03:00
```

`npm run db:backup` 用 SQLite 的 `VACUUM INTO` 生成一致性快照（**不用停服**），备份后会自动打开校验行数，并按 `BACKUP_KEEP` 轮转。

### 内容存档进 git（`npm run archive`）

把库导出成可读的 `server/data/*.json` 并提交、推送——这样"文章文字"就有一份跟着仓库走的异地副本（可 diff、可 `db:migrate` 重建库）。它只提交那四个存档文件，不会带上你正在改的其他代码。

```bash
# Linux crontab：每天 9:05 同步内容存档
5 9 * * * cd /srv/worldline-archive/server && npm run archive >> /var/log/worldline-archive.log 2>&1

# Windows 计划任务
schtasks /create /tn worldline-archive /tr "cmd /c cd /d E:\code\project\worldline-archive\server && npm run archive" /sc daily /st 09:05
```

> ⚠️ 如果你的仓库是**公开**的，这条任务等于把文章内容持续公开在 GitHub 上——框架可以公开，但内容是否愿意公开要自己拿主意；想分开就把 `ARCHIVE_REMOTE` 指向一个私有仓库。

### 媒体异地同步（`npm run sync:media`）

`uploads/` 被 gitignore 排除，只靠本机就等于"和数据库同一块盘"。先在 `server/.env` 里指定目标目录：

```ini
MEDIA_SYNC_TARGET=D:\backup\worldline        # 另一块盘 / 网盘同步目录 / 已挂载的对象存储
# MEDIA_SYNC_DIRS=uploads,data/backups       # 想连数据库快照一起带走就加上第二项
# MEDIA_SYNC_DELETE=false                    # 默认只增不删
```

```bash
# Linux crontab：每天 4 点同步媒体
0 4 * * * cd /srv/worldline-archive/server && npm run sync:media >> /var/log/worldline-media.log 2>&1

# Windows 计划任务
schtasks /create /tn worldline-media /tr "cmd /c cd /d E:\code\project\worldline-archive\server && npm run sync:media" /sc daily /st 04:00
```

同步是增量的（按大小 + 修改时间比对），第二次跑同一批文件会全部跳过。**「JSON 存档（git）+ uploads 异地副本」合起来就是一份完整可恢复的备份**——换机器时 `npm ci` → `db:migrate` → 把媒体目录拷回 `uploads/` 即可。

> 若你的环境有 `rsync`，也可以直接用它替代：`rsync -a --delete /srv/worldline-archive/server/uploads/ /backup/uploads/`；`sync:media` 的好处是跨平台（Windows 上没有 rsync 也能用）。

## 6. 媒体文件放到对象存储

数据库里存的是**相对路径** `/uploads/xxx.webp`，所以换存储不用改任何数据，只要让 `/uploads/` 这个前缀指到对象存储：

```nginx
location /uploads/ {
  proxy_pass https://your-bucket.oss-cn-hangzhou.aliyuncs.com/;
  proxy_set_header Host your-bucket.oss-cn-hangzhou.aliyuncs.com;
  expires 30d;
}
```

上传那一端要改 `routes/upload.js`：把 multer 的 `diskStorage` 换成对象存储 SDK（或用预签名 URL 让前端直传，大视频尤其推荐直传，别让 Node 中转）。注意 `utils/uploadFiles.js` 里删除内容是 `fs.unlinkSync`，换存储后要改成调用存储的删除接口，否则孤儿文件会堆在 bucket 里。

## 7. HTTPS

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d blog.example.com
```

有了 HTTPS 之后，分享卡片里的 `og:image` 会自动跟着协议走（代码里按请求头拼绝对地址）。

## 8. 升级流程

```bash
cd /srv/worldline-archive
git pull
cd server && npm ci && npm run db:init     # 结构有变更时执行（幂等）
npm run db:backup                          # 升级前先备一份
cd ../web && npm ci && npm run build
sudo systemctl restart worldline           # 或 pm2 restart worldline
```

## 9. 常见问题

| 现象 | 原因与处理 |
|---|---|
| `EADDRINUSE: address already in use :::3000` | 上一个后端进程没退干净。`netstat -ano \| findstr :3000` 找 PID → `taskkill /F /PID <pid>`（Git Bash 写 `taskkill //F //PID <pid>`）；Linux 用 `lsof -i:3000` / `kill` |
| 改了 `.env` 没生效 | `.env` 不参与热重载，重启后端 |
| 页面能开但接口 404 | nginx 没配 `/api/` 反代，或后端没起来 |
| 分享出去没有卡片 | 检查 `/article/<id>` 是否被反代到 Node（方式 A 的那条 `location ~ ^/article/`） |
| 登录提示"密码错误次数过多" | 触发了登录限流（同 IP 连续失败 5 次锁 10 分钟），等一会儿或用正确密码 |
| 上传大图后页面变慢 | 确认 `sharp` 装好了（`npm ci` 会装），上传时会自动压缩并生成缩略图；历史图可跑 `npm run images:optimize` |
| 老图片没有缩略图 | `npm run images:thumbs` 补一遍 |

## 10. 常用命令速查

```bash
npm run dev              # 开发模式（--watch-path，只监视代码目录）
npm start                # 生产运行
npm run db:init          # 建库建表（幂等）
npm run db:migrate       # 从 data/*.json 导入数据
npm run db:export        # 把库导回 data/*.json（版本库里的内容存档）
npm run db:backup        # 热备份 + 校验 + 轮转
npm run images:thumbs    # 补缩略图
npm run images:optimize  # 压缩历史大图并改写引用
npm run smoke            # 冒烟测试（需要服务在跑）
```
