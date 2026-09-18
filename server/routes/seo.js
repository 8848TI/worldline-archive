import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import { allContent } from '../utils/mappers.js'

// 博客的"能被搜到 / 能被转发"这一层：
//   * /sitemap.xml  给搜索引擎
//   * /rss.xml      给订阅器
//   * /article/:id  返回注入了 og:title / og:image 的 index.html，
//     这样分享到微信、QQ、Twitter 才有卡片，而不是一条光秃秃的链接。
//
// 说明：纯 SPA 拿不到逐篇的 meta，所以由服务端在返回 HTML 时注入。
// 生产环境有两种接法（见 docs/DEPLOY.md）：
//   1) nginx 只把 /article/ 与 /sitemap.xml、/rss.xml 反代给 Node，其余静态文件仍由 nginx 直接返回；
//   2) 全都交给 Node（app.js 里已挂 express.static(web/dist) + SPA 兜底）。
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_DIST = process.env.WEB_DIST ? path.resolve(process.env.WEB_DIST) : path.join(__dirname, '..', '..', 'web', 'dist')

const SITE_NAME = process.env.SITE_NAME || '世界线存档'
const SITE_DESC = process.env.SITE_DESC || '记录那些值得被收藏的世界线：BGM、动漫、电影、剧集、漫画、壁纸、随笔与代码笔记。'
const SITE_KEYWORDS = process.env.SITE_KEYWORDS || '动漫,电影,音乐,壁纸,随笔,代码笔记'

const router = Router()

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const originOf = (req) => `${req.protocol}://${req.get('host')}`
// og:image 必须是绝对地址，媒体存的是相对路径 /uploads/xxx，这里补全
const absolute = (req, url) => (!url ? '' : /^https?:/i.test(url) ? url : originOf(req) + url)

let cachedHtml = null
function readIndexHtml() {
  const file = path.join(WEB_DIST, 'index.html')
  if (!fs.existsSync(file)) return null
  if (!cachedHtml) cachedHtml = fs.readFileSync(file, 'utf-8')
  return cachedHtml
}

// 把生成的 meta 标签插到 </head> 之前
function injectMeta(html, tags) {
  return html.replace('</head>', `${tags}\n  </head>`)
}

function baseTags(req) {
  return [
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`
  ].join('\n    ')
}

// ── 单篇内容 → 页面 meta ──
function articleTags(req, item) {
  const url = `${originOf(req)}/article/${item.id}`
  const image = absolute(req, item.cover)
  return [
    baseTags(req),
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${esc(item.title)}" />`,
    `<meta property="og:description" content="${esc(item.summary || SITE_DESC)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image ? `<meta property="og:image" content="${esc(image)}" />` : '',
    `<meta name="description" content="${esc(item.summary || SITE_DESC)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    '<link rel="alternate" type="application/rss+xml" title="' + esc(SITE_NAME) + '" href="/rss.xml" />'
  ]
    .filter(Boolean)
    .join('\n    ')
}

function findArticle(id) {
  return allContent().find((i) => i.id === id) || null
}

// ── GET /sitemap.xml ──
router.get('/sitemap.xml', (req, res) => {
  const base = originOf(req)
  const statics = ['/', '/timeline', '/projects', '/tools', '/source', '/music', '/wallpaper']
  const items = allContent()
  const urls = [
    ...statics.map((p) => ({ loc: base + p, lastmod: null })),
    ...items.map((i) => ({ loc: `${base}/article/${i.id}`, lastmod: (i.updatedAt || i.createdAt || '').slice(0, 10) || null }))
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>`
  res.type('application/xml').send(xml)
})

// ── GET /rss.xml ──
router.get('/rss.xml', (req, res) => {
  const base = originOf(req)
  const items = allContent()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${esc(base)}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>zh-CN</language>
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(`${base}/article/${i.id}`)}</link>
      <guid isPermaLink="true">${esc(`${base}/article/${i.id}`)}</guid>
      <description>${esc(i.summary || '')}</description>
      <pubDate>${new Date(i.createdAt).toUTCString()}</pubDate>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`
  res.type('application/rss+xml').send(xml)
})

// ── 页面兜底：/article/:id 注入逐篇 meta，其余前端路由返回原始 index.html ──
// 只在 web/dist 存在（已 npm run build）时生效；开发态由 vite 提供页面，不走这里。
router.get(/^\/(?!api\/|uploads\/).+/, (req, res, next) => {
  // 带扩展名的请求（缺图、缺 js）不返回 HTML，交给后面的 404 处理
  if (path.extname(req.path)) return next()
  const html = readIndexHtml()
  if (!html) return next()

  const m = req.path.match(/^\/article\/([^/]+)$/)
  if (!m) {
    res.type('html').send(injectMeta(html, baseTags(req)))
    return
  }

  const item = findArticle(decodeURIComponent(m[1]))
  if (!item) {
    res.type('html').send(injectMeta(html, baseTags(req)))
    return
  }

  const title = `${item.title} · ${SITE_NAME}`
  const head = injectMeta(html, articleTags(req, item))
  // 顺便把静态的 <title> / description 换成本篇的
  const withTitle = head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(item.summary || SITE_DESC)}" />`)
  res.type('html').send(withTitle)
})

export { SITE_NAME, SITE_DESC, SITE_KEYWORDS, WEB_DIST }
export default router
