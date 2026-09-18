// 站点全局配置：集中管理站点元信息，便于统一修改与后续扩展。
// 头像 / 背景视频等资源留空时，对应组件会用占位样式渲染。

export const site = {
  name: '世界线存档',
  slogan: '记录那些值得被收藏的世界线',

  // 自我介绍卡片
  intro: {
    name: '世界线管理员',
    avatar: '', // 头像 URL，留空显示占位符
    bio: '喜欢收集好听的 BGM、好看的动画与电影，也偶尔写点代码和随笔。',
    links: [
      { label: 'GitHub', url: 'https://github.com' },
      { label: '邮箱', url: 'mailto:hello@example.com' }
    ]
  },

  // 网站公告
  announcement: '欢迎来到世界线存档 ✦ 本站持续建设中，感谢你的到来。',

  // 页脚
  icp: '备案号待填写',
  motto: '凡是过往，皆为序章。',

  // 天气预报卡片（mock 数据；接真实 API 时改 WeatherCard.vue）
  weather: {
    city: '北京',
    temp: '24°C',
    weather: '晴',
    icon: '☀️',
    forecast: [
      { day: '今天', icon: '☀️', temp: '24°' },
      { day: '明天', icon: '⛅', temp: '21°' },
      { day: '后天', icon: '🌧️', temp: '18°' }
    ]
  },

  // 顶部背景横幅：mode = video（视频）| carousel（图片轮播）
  hero: {
    mode: 'video',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    image: '', // 视频加载失败时的回退图
    images: [], // 轮播图片列表（mode = carousel 时使用）
    interval: 5 // 轮播切换间隔（秒）
  }
}
