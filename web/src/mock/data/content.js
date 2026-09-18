// 前端 mock：统一内容数据（结构对齐后端 server/data/content.json）
// cover 为空的条目由前端用「分类色块 + emoji」渲染占位，保证离线可用；
// 带封面/壁纸的条目使用 picsum 占位图，需要联网加载。
const md = (...lines) => lines.join('\n')

export const mockContent = [
  // ─────────────────── 日常随笔 ───────────────────
  {
    id: 'e1',
    type: 'essay',
    title: '深夜便利店与我的胡思乱想',
    summary: '凌晨两点的便利店像一个微缩的世界线，货架上的光把夜晚照得过分安静。',
    cover: '',
    tags: ['随笔', '夜晚', '生活'],
    createdAt: '2026-09-13T23:40:00.000Z',
    updatedAt: '2026-09-13T23:40:00.000Z',
    ext: {
      article: {
        wordCount: 620,
        content: md(
          '# 深夜便利店与我的胡思乱想',
          '',
          '凌晨两点，我走进那家 24 小时营业的便利店。自动门「叮咚」一声，像一个被按下开关的旧收音机。',
          '',
          '货架上的光白得过分，把每一瓶饮料都照得像是刚从冰箱里取出来的梦。我拿起一瓶牛奶，突然想起很多年前，也曾在同样的时刻，站在同样的位置。',
          '',
          '> 时间不是一条直线，它更像一个回环，我们只是不停地经过同一家便利店。',
          '',
          '收银台后的店员低着头，不知道在看什么。我猜他也有自己的世界线，只是此刻和我的短暂地重叠了一下。',
          '',
          '结账，出门。夜晚把声音都吸走了，只剩下塑料袋的沙沙声。'
        )
      }
    }
  },
  {
    id: 'e2',
    type: 'essay',
    title: '雨天、耳机与旧漫画',
    summary: '下雨天最适合做的事，是把一首老歌循环一整天，再翻出那本卷了边的漫画。',
    cover: '',
    tags: ['随笔', '雨天', '音乐'],
    createdAt: '2026-09-05T16:15:00.000Z',
    updatedAt: '2026-09-05T16:15:00.000Z',
    ext: {
      article: {
        wordCount: 480,
        content: md(
          '# 雨天、耳机与旧漫画',
          '',
          '雨从下午开始下，不大，但很密。我戴上耳机，随机播放到一首很旧的歌。',
          '',
          '音符落进雨声里，竟然分不清哪是雨，哪是歌。这大概就是「氛围」：你不需要刻意寻找意义，它自己就来了。',
          '',
          '书架最底层有一本卷了边的漫画，封面已经发黄。翻开来，纸页的味道混着潮湿的空气，像打开了某个夏天的存档。',
          '',
          '有些东西不会过时，只是需要一个合适的天气，把它重新打开。'
        )
      }
    }
  },
  {
    id: 'e3',
    type: 'essay',
    title: '关于「存档」这件事',
    summary: '为什么要把看过、听过的都记下来？大概是因为，记忆本身并不可靠。',
    cover: '',
    tags: ['随笔', '思考'],
    createdAt: '2026-08-22T20:00:00.000Z',
    updatedAt: '2026-08-22T20:00:00.000Z',
    ext: {
      article: {
        wordCount: 540,
        content: md(
          '# 关于「存档」这件事',
          '',
          '人的记忆是一种很不稳定的介质：它会模糊、会美化，也会在你毫无防备的时候悄悄篡改细节。',
          '',
          '所以我想做一个「存档点」：把喜欢的音乐、动画、电影、漫画，还有那些一闪而过的念头，都固定下来。',
          '',
          '- 每一首歌，都是一个时间坐标',
          '- 每一部动画，都是一段情绪',
          '- 每一篇随笔，都是一次对过去的致敬',
          '',
          '存档不是为了活在过去，而是为了在未来的某一天，能顺着这些坐标，回到当时的那条世界线。'
        )
      }
    }
  },
  {
    id: 'e4',
    type: 'essay',
    title: '海边的周末',
    summary: '周六去了海边，风很大，浪很白，坐在防波堤上发了很久的呆。',
    cover: 'https://picsum.photos/seed/worldline-e4a/1200/900',
    tags: ['生活', '旅行', '海'],
    createdAt: '2026-09-09T17:20:00.000Z',
    updatedAt: '2026-09-09T17:20:00.000Z',
    ext: {
      article: {
        wordCount: 380,
        images: [
          'https://picsum.photos/seed/worldline-e4a/1200/900',
          'https://picsum.photos/seed/worldline-e4b/1200/900',
          'https://picsum.photos/seed/worldline-e4c/1200/900'
        ],
        content: md(
          '# 海边的周末',
          '',
          '周六去了海边。风很大，浪很白，坐在防波堤上发了很久的呆。',
          '',
          '海的声音有一种奇怪的魔力：它足够吵，却又能把脑子里那些杂音全部盖掉。',
          '',
          '回程的公交上睡了一路，醒来的时候天已经黑了。'
        )
      }
    }
  },
  {
    id: 'e5',
    type: 'essay',
    title: '新相机试拍',
    summary: '终于把攒了很久的相机买回来了，随手拍了几张，才发现光比想象中难调。',
    cover: 'https://picsum.photos/seed/worldline-e5a/1200/900',
    tags: ['摄影', '生活'],
    createdAt: '2026-08-30T19:40:00.000Z',
    updatedAt: '2026-08-30T19:40:00.000Z',
    ext: {
      article: {
        wordCount: 320,
        images: [
          'https://picsum.photos/seed/worldline-e5a/1200/900',
          'https://picsum.photos/seed/worldline-e5b/1200/900'
        ],
        content: md(
          '# 新相机试拍',
          '',
          '终于把攒了很久的相机买回来了。',
          '',
          '随手拍了几张，才发现「光比」这件事比想象中难调——眼睛看到的层次，和相机记录下来的，总差着一点。',
          '',
          '看来还得多拍。'
        )
      }
    }
  },
  {
    id: 'e6',
    type: 'essay',
    title: '雨天的窗',
    summary: '下了一整天的雨，窗户上全是水痕，把外面的世界糊成了一幅水彩。',
    cover: 'https://picsum.photos/seed/worldline-e6a/1200/900',
    tags: ['雨天', '生活'],
    createdAt: '2026-08-18T15:10:00.000Z',
    updatedAt: '2026-08-18T15:10:00.000Z',
    ext: {
      article: {
        wordCount: 300,
        images: ['https://picsum.photos/seed/worldline-e6a/1200/900'],
        content: md(
          '# 雨天的窗',
          '',
          '下了一整天的雨。',
          '',
          '窗户上全是水痕，把外面的世界糊成了一幅水彩：楼房是灰的，树是墨的，路灯是暖黄的一团。',
          '',
          '这种天气最适合什么都不做。'
        )
      }
    }
  },

  // ─────────────────── 代码分析笔记 ───────────────────
  {
    id: 'c1',
    type: 'code',
    title: 'Vue3 组合式 API 心智模型笔记',
    summary: '组合式 API 的核心不是语法糖，而是把同一逻辑相关的状态与副作用聚合到一起。',
    cover: '',
    tags: ['Vue', '前端', '笔记'],
    createdAt: '2026-09-08T10:30:00.000Z',
    updatedAt: '2026-09-08T10:30:00.000Z',
    ext: {
      article: {
        wordCount: 900,
        content: md(
          '# Vue3 组合式 API 心智模型笔记',
          '',
          '组合式 API 的核心不是语法糖，而是**把同一逻辑相关的状态与副作用聚合到一起**，让「这个组件在做什么」变得可读。',
          '',
          '## 三个关键点',
          '',
          '1. `ref` 用于基本类型，`reactive` 用于对象，但底层都是同一套响应式原理（Proxy + 依赖收集）。',
          '2. 生命周期钩子可以在 `setup` 中多次声明，按声明顺序执行。',
          '3. `computed` 是惰性、带缓存的派生状态；`watch` 用于「状态变化后做点事」。',
          '',
          '## 一个最小示例',
          '',
          '```js',
          "import { ref, computed } from 'vue'",
          '',
          'const count = ref(0)',
          'const doubled = computed(() => count.value * 2)',
          '```',
          '',
          '把上面的模式迁移到自定义 `useXxx` 函数里，就是组合式 API 最大的价值：**逻辑复用**。'
        )
      }
    }
  },
  {
    id: 'c2',
    type: 'code',
    title: '从零搭建一个 JSON 文件数据库',
    summary: '用最少的代码实现读写、筛选、分页与排序，为后续平滑迁移到真实数据库留好接口。',
    cover: '',
    tags: ['Node.js', '后端', '数据存储'],
    createdAt: '2026-08-30T14:00:00.000Z',
    updatedAt: '2026-08-30T14:00:00.000Z',
    ext: {
      article: {
        wordCount: 820,
        content: md(
          '# 从零搭建一个 JSON 文件数据库',
          '',
          '小项目不想引入数据库？一个 `storage` 模块就够了。关键是把文件读写封装在**一个地方**，路由层只调用 `load()` / `save()`。',
          '',
          '```js',
          "import fs from 'node:fs'",
          "import path from 'node:path'",
          '',
          'function readJson(filename, fallback = []) {',
          '  try {',
          '    return JSON.parse(fs.readFileSync(filename, "utf-8"))',
          '  } catch {',
          '    return fallback',
          '  }',
          '}',
          '```',
          '',
          '这样做的最大好处是：将来迁移到 SQLite / MySQL / PostgreSQL 时，只需要替换 `storage` 内部实现，业务路由一行都不用改。'
        )
      }
    }
  },
  {
    id: 'c3',
    type: 'code',
    title: 'CSS 毛玻璃 backdrop-filter 实践',
    summary: '毛玻璃质感的实现要点、性能陷阱，以及与主题变量结合的优雅做法。',
    cover: '',
    tags: ['CSS', '前端', '视觉'],
    createdAt: '2026-08-18T11:20:00.000Z',
    updatedAt: '2026-08-18T11:20:00.000Z',
    ext: {
      article: {
        wordCount: 700,
        content: md(
          '# CSS 毛玻璃 backdrop-filter 实践',
          '',
          '毛玻璃（Glassmorphism）的核心属性只有一行：',
          '',
          '```css',
          '.glass {',
          '  background: rgba(255,255,255,0.72);',
          '  backdrop-filter: blur(20px) saturate(1.2);',
          '}',
          '```',
          '',
          '需要注意：',
          '',
          '- 背景必须是半透明，否则模糊效果看不见',
          '- `backdrop-filter` 在部分老浏览器需要 `-webkit-` 前缀',
          '- 大量模糊层会带来 GPU 开销，不要滥用',
          '',
          '配合主题变量（`--surface-glass` / `--blur`），深浅两套主题可以共用同一份样式。'
        )
      }
    }
  },

  // ─────────────────── 动漫 ───────────────────
  {
    id: 'a1',
    type: 'anime',
    title: '葬送的芙莉莲',
    summary: '魔王被讨伐之后，长生种的精灵魔法使芙莉莲，踏上重新理解「人类」与「时间」的旅程。',
    cover: 'https://picsum.photos/seed/worldline-a1/600/900',
    tags: ['奇幻', '治愈', '冒险'],
    createdAt: '2026-09-11T19:00:00.000Z',
    updatedAt: '2026-09-11T19:00:00.000Z',
    ext: { media: { rating: 9.4, year: 2023, status: '已看完', episodes: 28 } }
  },
  {
    id: 'a2',
    type: 'anime',
    title: '孤独摇滚！',
    summary: '社交恐惧的吉他少女后藤独，加入「结束乐队」，在舞台上一点点找到自己的声音。',
    cover: 'https://picsum.photos/seed/worldline-a2/600/900',
    tags: ['音乐', '日常', '喜剧'],
    createdAt: '2026-08-25T21:00:00.000Z',
    updatedAt: '2026-08-25T21:00:00.000Z',
    ext: { media: { rating: 9.1, year: 2022, status: '已看完', episodes: 12 } }
  },
  {
    id: 'a3',
    type: 'anime',
    title: '间谍过家家',
    summary: '间谍、杀手与超能力少女组成的临时家庭，在笑料与温情中互相守护。',
    cover: 'https://picsum.photos/seed/worldline-a3/600/900',
    tags: ['喜剧', '日常', '家庭'],
    createdAt: '2026-07-18T20:30:00.000Z',
    updatedAt: '2026-07-18T20:30:00.000Z',
    ext: { media: { rating: 8.9, year: 2022, status: '在看', episodes: 37 } }
  },
  {
    id: 'a4',
    type: 'anime',
    title: '葬送的芙莉莲 第二季',
    summary: '继续向北的旅程，新的同伴与更远的北方，芙莉莲与时间的和解仍在继续。',
    cover: 'https://picsum.photos/seed/worldline-a4/600/900',
    tags: ['奇幻', '治愈', '冒险'],
    createdAt: '2026-06-10T19:30:00.000Z',
    updatedAt: '2026-06-10T19:30:00.000Z',
    ext: { media: { rating: 9.6, year: 2026, status: '想看', episodes: null } }
  },

  // ─────────────────── 电影 ───────────────────
  {
    id: 'm1',
    type: 'movie',
    title: '你的名字。',
    summary: '两个素未谋面的少年少女，在梦中交换身体，也交换了一段跨越时间的命运。',
    cover: 'https://picsum.photos/seed/worldline-m1/600/900',
    tags: ['新海诚', '爱情', '奇幻'],
    createdAt: '2026-09-02T22:10:00.000Z',
    updatedAt: '2026-09-02T22:10:00.000Z',
    ext: { media: { rating: 9.0, year: 2016, status: '已看完', episodes: null } }
  },
  {
    id: 'm2',
    type: 'movie',
    title: '天气之子',
    summary: '离家出走的少年，遇见能让天空放晴的少女，从此世界的天气开始有了代价。',
    cover: 'https://picsum.photos/seed/worldline-m2/600/900',
    tags: ['新海诚', '奇幻', '青春'],
    createdAt: '2026-08-08T21:45:00.000Z',
    updatedAt: '2026-08-08T21:45:00.000Z',
    ext: { media: { rating: 8.6, year: 2019, status: '已看完', episodes: null } }
  },
  {
    id: 'm3',
    type: 'movie',
    title: '铃芽之旅',
    summary: '少女铃芽与「闭门师」草太，为了阻止灾厄，踏上一场关门之旅。',
    cover: 'https://picsum.photos/seed/worldline-m3/600/900',
    tags: ['新海诚', '奇幻', '公路'],
    createdAt: '2026-07-05T20:00:00.000Z',
    updatedAt: '2026-07-05T20:00:00.000Z',
    ext: { media: { rating: 8.7, year: 2022, status: '已看完', episodes: null } }
  },

  // ─────────────────── 电视剧 ───────────────────
  {
    id: 'd1',
    type: 'drama',
    title: '重启人生',
    summary: '普通职员近藤麻美意外离世后获得重来的机会，为了「下辈子转生为人」而一次次积攒功德。',
    cover: 'https://picsum.photos/seed/worldline-d1/600/900',
    tags: ['日剧', '治愈', '奇幻'],
    createdAt: '2026-08-12T23:00:00.000Z',
    updatedAt: '2026-08-12T23:00:00.000Z',
    ext: { media: { rating: 9.3, year: 2023, status: '已看完', episodes: 10 } }
  },
  {
    id: 'd2',
    type: 'drama',
    title: '海女',
    summary: '东京少女天野秋回到北三陆海边，成为一名海女，也在海风里重新认识了自己。',
    cover: 'https://picsum.photos/seed/worldline-d2/600/900',
    tags: ['日剧', '晨间剧', '治愈'],
    createdAt: '2026-06-28T09:30:00.000Z',
    updatedAt: '2026-06-28T09:30:00.000Z',
    ext: { media: { rating: 9.2, year: 2013, status: '想看', episodes: 156 } }
  },

  // ─────────────────── 漫画 ───────────────────
  {
    id: 'mg1',
    type: 'manga',
    title: '葬送的芙莉莲（漫画）',
    summary: '动画之外的原作漫画，分镜与留白让「时间感」更加绵长。',
    cover: 'https://picsum.photos/seed/worldline-mg1/600/900',
    tags: ['奇幻', '治愈', '漫画'],
    createdAt: '2026-08-20T18:00:00.000Z',
    updatedAt: '2026-08-20T18:00:00.000Z',
    ext: { media: { rating: 9.5, year: 2020, status: '在看', episodes: 140 } }
  },
  {
    id: 'mg2',
    type: 'manga',
    title: '我推的孩子',
    summary: '从偶像的粉丝与孩子的双重视角，揭开娱乐圈光鲜表象下的真实。',
    cover: 'https://picsum.photos/seed/worldline-mg2/600/900',
    tags: ['娱乐圈', '悬疑', '漫画'],
    createdAt: '2026-07-22T21:30:00.000Z',
    updatedAt: '2026-07-22T21:30:00.000Z',
    ext: { media: { rating: 8.8, year: 2020, status: '已看完', episodes: 160 } }
  },
  {
    id: 'mg3',
    type: 'manga',
    title: '迷宫饭',
    summary: '在迷宫里「边冒险边做饭」的另类地下城物语，硬核又可爱。',
    cover: 'https://picsum.photos/seed/worldline-mg3/600/900',
    tags: ['美食', '奇幻', '漫画'],
    createdAt: '2026-06-15T12:00:00.000Z',
    updatedAt: '2026-06-15T12:00:00.000Z',
    ext: { media: { rating: 9.0, year: 2014, status: '想看', episodes: 100 } }
  },

  // ─────────────────── 壁纸美图（以电脑横屏壁纸为主，每类保留 1 张手机竖屏） ───────────────────
  {
    id: 'w1',
    type: 'wallpaper',
    title: '国漫壁纸',
    summary: '国产动画相关壁纸合集，以电脑横屏壁纸为主。',
    cover: '',
    tags: ['国漫'],
    createdAt: '2026-08-06T20:00:00.000Z',
    updatedAt: '2026-08-06T20:00:00.000Z',
    ext: {
      wallpaper: {
        images: [
          { url: 'https://picsum.photos/seed/worldline-w1a/1920/1080', width: 1920, height: 1080, title: '国漫 · 电脑壁纸 一' },
          { url: 'https://picsum.photos/seed/worldline-w1b/1920/1200', width: 1920, height: 1200, title: '国漫 · 电脑壁纸 二' },
          { url: 'https://picsum.photos/seed/worldline-w1c/1600/900', width: 1600, height: 900, title: '国漫 · 电脑壁纸 三' },
          { url: 'https://picsum.photos/seed/worldline-w1d/800/1400', width: 800, height: 1400, title: '国漫 · 手机壁纸' }
        ]
      }
    }
  },
  {
    id: 'w2',
    type: 'wallpaper',
    title: '日漫壁纸',
    summary: '日系动画相关壁纸合集，以电脑横屏壁纸为主。',
    cover: '',
    tags: ['日漫'],
    createdAt: '2026-07-28T20:00:00.000Z',
    updatedAt: '2026-07-28T20:00:00.000Z',
    ext: {
      wallpaper: {
        images: [
          { url: 'https://picsum.photos/seed/worldline-w2a/1920/1080', width: 1920, height: 1080, title: '日漫 · 电脑壁纸 一' },
          { url: 'https://picsum.photos/seed/worldline-w2b/1920/1200', width: 1920, height: 1200, title: '日漫 · 电脑壁纸 二' },
          { url: 'https://picsum.photos/seed/worldline-w2c/1600/900', width: 1600, height: 900, title: '日漫 · 电脑壁纸 三' },
          { url: 'https://picsum.photos/seed/worldline-w2d/800/1400', width: 800, height: 1400, title: '日漫 · 手机壁纸' }
        ]
      }
    }
  },
  {
    id: 'w3',
    type: 'wallpaper',
    title: '港风壁纸',
    summary: '港风复古氛围壁纸合集，以电脑横屏壁纸为主。',
    cover: '',
    tags: ['港风'],
    createdAt: '2026-07-15T20:00:00.000Z',
    updatedAt: '2026-07-15T20:00:00.000Z',
    ext: {
      wallpaper: {
        images: [
          { url: 'https://picsum.photos/seed/worldline-w3a/1920/1080', width: 1920, height: 1080, title: '港风 · 电脑壁纸 一' },
          { url: 'https://picsum.photos/seed/worldline-w3b/1920/1200', width: 1920, height: 1200, title: '港风 · 电脑壁纸 二' },
          { url: 'https://picsum.photos/seed/worldline-w3c/1600/900', width: 1600, height: 900, title: '港风 · 电脑壁纸 三' },
          { url: 'https://picsum.photos/seed/worldline-w3d/800/1400', width: 800, height: 1400, title: '港风 · 手机壁纸' }
        ]
      }
    }
  },
  {
    id: 'w4',
    type: 'wallpaper',
    title: '电脑壁纸',
    summary: '横屏电脑壁纸合集，适合桌面与笔记本。',
    cover: '',
    tags: ['电脑'],
    createdAt: '2026-07-02T20:00:00.000Z',
    updatedAt: '2026-07-02T20:00:00.000Z',
    ext: {
      wallpaper: {
        images: [
          { url: 'https://picsum.photos/seed/worldline-w4a/1920/1080', width: 1920, height: 1080, title: '电脑壁纸 · 一' },
          { url: 'https://picsum.photos/seed/worldline-w4b/2560/1440', width: 2560, height: 1440, title: '电脑壁纸 · 二' },
          { url: 'https://picsum.photos/seed/worldline-w4c/1920/1200', width: 1920, height: 1200, title: '电脑壁纸 · 三' },
          { url: 'https://picsum.photos/seed/worldline-w4d/1600/900', width: 1600, height: 900, title: '电脑壁纸 · 四' }
        ]
      }
    }
  },

  // ─────────────────── 项目 ───────────────────
  {
    id: 'pj1',
    type: 'project',
    title: '世界线存档',
    summary: '本站——一个收藏 BGM、动漫、电影、漫画、壁纸与随笔的个人博客，前后端分离架构。',
    cover: '',
    tags: ['技术/前端', '技术/后端'],
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    ext: { project: { url: 'https://github.com/yourname/worldline-archive' } }
  },
  {
    id: 'pj2',
    type: 'project',
    title: '示例项目 A',
    summary: '一个用于演示项目卡片布局的示例项目，描述占位，之后替换为真实项目。',
    cover: '',
    tags: ['技术/前端'],
    createdAt: '2026-05-18T10:00:00.000Z',
    updatedAt: '2026-05-18T10:00:00.000Z',
    ext: { project: { url: 'https://github.com/yourname/example-a' } }
  },
  {
    id: 'pj3',
    type: 'project',
    title: '示例项目 B',
    summary: '另一个示例项目，展示技术标签的展示方式。',
    cover: '',
    tags: ['技术/后端'],
    createdAt: '2026-05-06T10:00:00.000Z',
    updatedAt: '2026-05-06T10:00:00.000Z',
    ext: { project: { url: 'https://github.com/yourname/example-b' } }
  },

  // ─────────────────── 工具箱 ───────────────────
  {
    id: 'tl1',
    type: 'tool',
    title: 'JSON 格式化',
    summary: '在线 JSON 格式化 / 校验工具，粘贴即用。',
    cover: '',
    tags: ['技术/工具'],
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
    ext: { tool: { url: 'https://www.json.cn' } }
  },
  {
    id: 'tl2',
    type: 'tool',
    title: '时间戳转换',
    summary: 'Unix 时间戳与日期互转，调试常用。',
    cover: '',
    tags: ['技术/工具'],
    createdAt: '2026-04-12T10:00:00.000Z',
    updatedAt: '2026-04-12T10:00:00.000Z',
    ext: { tool: { url: 'https://tool.lu/timestamp' } }
  }
]
