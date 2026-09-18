// 后端冒烟测试：改完后端跑一次，确认核心链路没坏。
// 运行：npm run smoke        （需要后端已经在 3000 端口跑着）
//   BASE_URL 可覆盖，例如 BASE_URL=http://localhost:3000 npm run smoke
//
// 覆盖：只读接口 → 鉴权拦截 → 内容/音乐的增改删 → 入参校验 → SEO 输出。
// 测试用的数据会自己删掉，不会留在库里。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API = `${process.env.BASE_URL || 'http://localhost:3000'}/api`
const ROOT = `http://localhost:${new URL(API).port || 80}`

let pass = 0
let fail = 0
const check = (name, ok, extra = '') => {
  if (ok) {
    pass++
    console.log(`  ✓ ${name}${extra ? ' → ' + extra : ''}`)
  } else {
    fail++
    console.log(`  ✗ ${name}${extra ? ' → ' + extra : ''}`)
  }
}
const get = async (p) => (await fetch(API + p)).json()

// 从 .env 读登录凭据（不打印）
function credentials() {
  const file = path.join(__dirname, '..', '.env')
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : ''
  const val = (k) => text.split('\n').find((l) => l.startsWith(k + '='))?.split('=').slice(1).join('=')
  return { username: val('ADMIN_USER') || 'root', password: val('ADMIN_PASS') || '123456' }
}

console.log('冒烟测试 →', API)

console.log('\n── 只读接口 ──')
const content = await get('/content?pageSize=100')
check('GET /content', typeof content.total === 'number' && Array.isArray(content.list), `total=${content.total}`)
check('GET /music', Array.isArray((await get('/music')).list))
check('GET /tags', Array.isArray((await get('/tags')).list))
check('GET /timeline', Array.isArray((await get('/timeline')).groups))
check('GET /wallpapers', Array.isArray((await get('/wallpapers')).list))
check('GET /settings', typeof (await get('/settings')) === 'object')
check('GET /tag-categories', Array.isArray((await get('/tag-categories')).list))
check('GET /docs', ((await get('/docs')).endpoints || []).length > 0)
if (content.list[0]) check('GET /content/:id', (await get(`/content/${content.list[0].id}`)).id === content.list[0].id)

console.log('\n── 鉴权 ──')
const anon = await fetch(`${API}/content`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'essay', title: 'x' }) })
check('未登录写接口 → 401', anon.status === 401)

const { username, password } = credentials()
const login = await (await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })).json()
check('登录成功', !!login.token)
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` }
check('GET /auth/check', (await (await fetch(`${API}/auth/check`, { headers: { Authorization: H.Authorization } })).json()).ok === true)

console.log('\n── 增改删 ──')
const created = await (await fetch(`${API}/content`, { method: 'POST', headers: H, body: JSON.stringify({ type: 'essay', title: '冒烟测试条目', summary: '临时', tags: ['测试'], ext: { article: { content: '正文', images: [], wordCount: 2 } } }) })).json()
check('POST /content', !!created.id, created.id)
const updated = await (await fetch(`${API}/content/${created.id}`, { method: 'PUT', headers: H, body: JSON.stringify({ title: '冒烟测试条目-改', tags: ['测试', '改'] }) })).json()
check('PUT /content', updated.title === '冒烟测试条目-改' && updated.tags.length === 2)
const track = await (await fetch(`${API}/content`, { method: 'POST', headers: H, body: JSON.stringify({ type: 'music', title: '冒烟测试曲目', tags: [], ext: { music: { artist: 'a', album: '', audioUrl: '/uploads/none.m4a', duration: 0 } } }) })).json()
check('POST music', !!track.id)
const trackUpdated = await (await fetch(`${API}/content/${track.id}`, { method: 'PUT', headers: H, body: JSON.stringify({ ext: { music: { artist: 'a', album: '', audioUrl: '/uploads/none.m4a', duration: 123 } } }) })).json()
check('PUT music 保留 duration', trackUpdated.duration === 123)

console.log('\n── 入参校验 ──')
const badTitle = await fetch(`${API}/content`, { method: 'POST', headers: H, body: JSON.stringify({ type: 'essay' }) })
check('缺 title → 400', badTitle.status === 400, (await badTitle.json()).message)
const badType = await fetch(`${API}/content`, { method: 'POST', headers: H, body: JSON.stringify({ type: 'nope', title: 'x' }) })
check('非法 type → 400', badType.status === 400)

console.log('\n── SEO ──')
const sm = await fetch(`${ROOT}/sitemap.xml`)
check('GET /sitemap.xml', sm.status === 200 && (await sm.text()).includes('<urlset'))
const rss = await fetch(`${ROOT}/rss.xml`)
check('GET /rss.xml', rss.status === 200 && (await rss.text()).includes('<rss'))
if (content.list[0]) {
  const html = await (await fetch(`${ROOT}/article/${content.list[0].id}`)).text()
  check('文章页注入 og:title', html.includes('property="og:title"'))
}

console.log('\n── 清理 ──')
await fetch(`${API}/content/${created.id}`, { method: 'DELETE', headers: H })
await fetch(`${API}/content/${track.id}`, { method: 'DELETE', headers: H })
const after = await get('/content?pageSize=100')
check('测试数据已清理、条数复原', after.total === content.total, `total=${after.total}`)

console.log(`\n结果：通过 ${pass} 项，失败 ${fail} 项`)
process.exit(fail ? 1 : 0)
