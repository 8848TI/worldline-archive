<template>
  <div class="app-shell">
    <AppHeader v-if="!isAdmin" />

    <!-- 全站背景横幅（后台页面不显示） -->
    <HeroBanner v-if="!isAdmin" />

    <main class="app-main">
      <div class="shell" :class="{ 'shell-admin': isAdmin }">
        <!-- 左栏：常驻工具 -->
        <aside v-if="!isAdmin" class="col shell-left">
          <SelfIntroCard />
          <AnnouncementCard />
          <WeatherCard />
          <CategoryListCard :categories="articleCategories" :active="filter.category" @select="onCategorySelect" />
          <TagListCard :tags="articleTags" :active="filter.tag" @select="onTagSelect" />
        </aside>

        <!-- 中栏：随路由切换的内容区 -->
        <main class="col shell-center" :class="{ 'center-card': !isHome && !isAdmin }">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>

        <!-- 右栏：常驻工具 -->
        <aside v-if="!isAdmin" class="col shell-right">
          <StatsCard :stats="stats" />
          <MusicCard />
          <CalendarCard />
        </aside>
      </div>
    </main>

    <AppFooter />
    <AudioEngine />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroBanner from '@/components/layout/HeroBanner.vue'
import AudioEngine from '@/components/layout/AudioEngine.vue'
import SelfIntroCard from '@/components/home/SelfIntroCard.vue'
import AnnouncementCard from '@/components/home/AnnouncementCard.vue'
import WeatherCard from '@/components/home/WeatherCard.vue'
import CategoryListCard from '@/components/home/CategoryListCard.vue'
import TagListCard from '@/components/home/TagListCard.vue'
import StatsCard from '@/components/home/StatsCard.vue'
import MusicCard from '@/components/home/MusicCard.vue'
import CalendarCard from '@/components/home/CalendarCard.vue'
import { useContentStore } from '@/stores/content'
import { useFilterStore } from '@/stores/filter'
import { useThemeStore } from '@/stores/theme'
import { useSiteStore } from '@/stores/site'
import { ARTICLE_TYPES } from '@/constants/categories'

const route = useRoute()
const router = useRouter()
const theme = useThemeStore()
const siteStore = useSiteStore()
const content = useContentStore()
const filter = useFilterStore()

const isHome = computed(() => route.path === '/')
const isAdmin = computed(() => route.path.startsWith('/admin'))

// 文章分类（日常随笔 / 代码笔记）及数量
const articleCategories = computed(() => {
  const counts = { essay: 0, code: 0 }
  for (const i of content.all) if (counts[i.type] != null) counts[i.type]++
  return [
    { key: 'essay', label: '日常随笔', emoji: '✍️', count: counts.essay },
    { key: 'code', label: '代码笔记', emoji: '💻', count: counts.code }
  ]
})

// 文章标签（仅统计文章类标签）
const articleTags = computed(() => {
  const map = {}
  for (const i of content.all) {
    if (!ARTICLE_TYPES.includes(i.type)) continue
    for (const t of i.tags || []) map[t] = (map[t] || 0) + 1
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

// 站点统计：前端聚合现有接口数据
const stats = computed(() => {
  const c = { essay: 0, code: 0, music: 0, anime: 0, movie: 0, drama: 0, manga: 0, wallpaper: 0, project: 0, tool: 0 }
  for (const i of content.all) if (c[i.type] != null) c[i.type]++
  return [
    { label: '文章', value: c.essay + c.code },
    { label: '音乐', value: c.music },
    { label: '动漫', value: c.anime },
    { label: '壁纸', value: c.wallpaper },
    { label: '影视', value: c.movie + c.drama },
    { label: '说说', value: c.essay },
    { label: '项目', value: c.project },
    { label: '工具', value: c.tool }
  ]
})

// 点击侧栏分类/标签：设置筛选并回到首页文章列表
function onCategorySelect(key) {
  filter.toggleCategory(key)
  if (route.path !== '/') router.push('/')
}

function onTagSelect(tag) {
  filter.toggleTag(tag)
  if (route.path !== '/') router.push('/')
}

onMounted(() => {
  theme.apply()
  content.load()
  siteStore.load()
})

// 从后台返回博客时刷新内容与横幅设置，避免看到后台修改前的旧数据
watch(
  () => route.path,
  (now, prev) => {
    if (prev.startsWith('/admin') && !now.startsWith('/admin')) {
      content.load(true)
      siteStore.load()
    }
  }
)
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding-bottom: 40px;
}

.shell {
  width: 85%;
  max-width: 1400px;
  margin: -56px auto 0;
  /* 提升层级盖在视频之上（外壳本身透明，不设背景） */
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 280px;
  grid-template-areas: 'left center right';
  gap: 20px;
  align-items: start;
}

/* 后台页面：单列全宽，无侧栏与横幅 */
.shell-admin {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'center';
  margin-top: 20px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.shell-left {
  grid-area: left;
}

.shell-center {
  grid-area: center;
}

/* 非首页：中间内容区套一层毛玻璃半透明圆角卡片 */
.center-card {
  background: var(--surface-glass);
  backdrop-filter: blur(var(--blur)) saturate(1.15);
  -webkit-backdrop-filter: blur(var(--blur)) saturate(1.15);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.shell-right {
  grid-area: right;
}

@media (max-width: 1100px) {
  .shell {
    width: 90%;
    grid-template-columns: 240px minmax(0, 1fr);
    grid-template-areas: 'left center' 'right right';
  }
  .shell-right {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 720px) {
  .shell {
    width: 92%;
    margin-top: -20px;
    /* minmax(0, 1fr) 防止内容撑出容器造成横向滚动 */
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'center' 'left' 'right';
    gap: 16px;
  }
  /* 后台页没有导航栏，需要自己留出与顶部的距离 */
  .shell-admin {
    margin-top: 20px;
  }
  .shell-right {
    grid-template-columns: 1fr;
  }
}
</style>
