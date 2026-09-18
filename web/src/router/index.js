import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { isLoggedIn } from '@/utils/authToken'

// 路由表：所有页面都渲染在 App.vue 的三栏外壳中间列（左右侧栏常驻）。
const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: '首页' } },
  { path: '/timeline', name: 'timeline', component: () => import('@/views/TimelineView.vue'), meta: { title: '归档' } },
  { path: '/category/:type?', name: 'category', component: () => import('@/views/CategoryView.vue'), meta: { title: '文娱集' } },
  { path: '/music', name: 'music', component: () => import('@/views/MusicView.vue'), meta: { title: '音乐' } },
  { path: '/wallpaper', name: 'wallpaper', component: () => import('@/views/WallpaperView.vue'), meta: { title: '壁纸插画' } },
  { path: '/tags', name: 'tags', component: () => import('@/views/TagArchiveView.vue'), meta: { title: '标签' } },
  { path: '/article/:id', name: 'article', component: () => import('@/views/ArticleDetailView.vue'), meta: { title: '文章' } },
  { path: '/talks', name: 'talks', component: () => import('@/views/TalksView.vue'), meta: { title: '日常说说' } },
  { path: '/admin', name: 'admin', component: () => import('@/views/AdminView.vue'), meta: { title: '后台管理' } },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/SimplePageView.vue'),
    meta: { title: '关于', description: '这里是「世界线存档」——一个收藏 BGM、动漫、电影、漫画、壁纸与随笔的个人小站。' }
  },
  { path: '/tools', name: 'tools', component: () => import('@/views/ToolsView.vue'), meta: { title: '工具箱' } },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { title: '项目' }
  },
  {
    path: '/source',
    name: 'source',
    component: () => import('@/views/SimplePageView.vue'),
    meta: { title: '源码', description: '本站源码仓库建设中，后续会在此放出链接。' }
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { title: '404' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// 路由守卫：后台页面需要登录
router.beforeEach((to) => {
  if (to.path.startsWith('/admin') && !isLoggedIn()) {
    ElMessage.warning('请先登录后再进入后台')
    return { path: '/' }
  }
  return true
})

router.afterEach((to) => {
  const base = '世界线存档'
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router
