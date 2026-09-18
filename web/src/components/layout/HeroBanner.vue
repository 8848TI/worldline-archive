<template>
  <div class="hero">
    <!-- 视频模式 -->
    <template v-if="!isCarousel">
      <video
        v-if="siteStore.hero.video && !videoError"
        class="hero-media"
        :src="siteStore.hero.video"
        autoplay
        muted
        loop
        playsinline
        @error="videoError = true"
      ></video>
      <img v-else-if="siteStore.hero.image" class="hero-media" :src="siteStore.hero.image" alt="" />
    </template>

    <!-- 图片轮播模式：淡入淡出 -->
    <template v-else>
      <div
        v-for="(src, i) in heroImages"
        :key="`${i}-${src}`"
        class="hero-slide"
        :class="{ active: i === slideIndex }"
      >
        <!-- 模糊铺底：填满两侧，避免留白 -->
        <div class="hero-slide-bg" :style="{ backgroundImage: `url(${src})` }"></div>
        <!-- 原图按比例完整显示（不裁切） -->
        <img class="hero-slide-img" :src="src" alt="" />
      </div>
    </template>
    <div class="hero-content">
      <!-- key 变化时元素重建，CSS 动画自动播放（比 <Transition> 更稳） -->
      <h1 :key="bannerTitle" class="hero-title">{{ bannerTitle }}</h1>
      <!-- 站点格言只在首页显示 -->
      <p v-if="isHome" class="hero-slogan">{{ site.slogan }}</p>
    </div>

    <div class="hero-waves" aria-hidden="true">
      <svg class="wave wave-1" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,80 C240,120 480,40 720,70 C960,100 1200,30 1440,60 L1440,120 L0,120 Z" />
      </svg>
      <svg class="wave wave-2" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,60 C200,30 440,90 720,50 C1000,10 1240,80 1440,40 L1440,120 L0,120 Z" />
      </svg>
      <svg class="wave wave-3" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,40 C300,80 600,20 900,50 C1200,90 1350,10 1440,30 L1440,120 L0,120 Z" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { site } from '@/config/site'
import { getCategory } from '@/constants/categories'
import { useSiteStore } from '@/stores/site'

const siteStore = useSiteStore()
const route = useRoute()
const videoError = ref(false) // 背景视频加载失败时回退到渐变/氛围图

// 横幅标题跟随当前页面：首页显示站点名，其余页面显示对应页面名
const isHome = computed(() => route.path === '/')

const bannerTitle = computed(() => {
  if (route.path === '/') return site.name
  if (route.name === 'category') {
    const t = route.params.type
    return t ? getCategory(t).label : '文娱集'
  }
  return route.meta?.banner || route.meta?.title || site.name
})

// ── 图片轮播 ──
const heroImages = computed(() => (siteStore.hero.images || []).filter(Boolean))
const isCarousel = computed(() => siteStore.hero.mode === 'carousel' && heroImages.value.length > 0)
const slideIndex = ref(0)
let timer = null

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  if (!isCarousel.value || heroImages.value.length < 2) return
  const sec = Math.max(2, Number(siteStore.hero.interval) || 5)
  timer = setInterval(() => {
    slideIndex.value = (slideIndex.value + 1) % heroImages.value.length
  }, sec * 1000)
}

// 模式 / 图片数量 / 间隔变化时重置轮播
watch(
  () => [siteStore.hero.mode, heroImages.value.length, siteStore.hero.interval],
  () => {
    slideIndex.value = 0
    startTimer()
  },
  { immediate: true }
)

// 换了视频地址后重置错误标记，重新尝试加载
watch(
  () => siteStore.hero.video,
  () => {
    videoError.value = false
  }
)

onUnmounted(stopTimer)
</script>

<style scoped>
.hero {
  position: relative;
  height: 57vh;
  min-height: 420px;
  /* 铺到导航栏后面：上移盖住导航栏高度，视频顶到屏幕最上方 */
  margin-top: calc(-1 * (var(--header-h) + 12px));
  padding-top: calc(var(--header-h) + 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(80% 120% at 72% 0%, var(--primary-soft), transparent 60%),
    radial-gradient(60% 100% at 18% 10%, rgba(217, 166, 184, 0.1), transparent 60%),
    var(--bg-soft);
}

.hero-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 轮播图片：淡入淡出 */
.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.2s ease;
}

.hero-slide.active {
  opacity: 1;
}

/* 模糊铺底层：填满画面两侧，避免出现空白边 */
.hero-slide-bg {
  position: absolute;
  inset: -60px;
  background-size: cover;
  background-position: center;
  filter: blur(26px) saturate(1.1) brightness(0.8);
}

/* 原图：铺满整屏（超出部分裁切） */
.hero-slide-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-content {
  position: relative;
  text-align: center;
  z-index: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 12px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
}

.hero-slogan {
  font-size: var(--fs-body);
  color: var(--text-2);
  letter-spacing: 1px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

/* 切换页面时标题淡入（元素重建触发动画） */
.hero-title {
  animation: heroTitleIn 0.35s ease both;
}

@keyframes heroTitleIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 720px) {
  .hero {
    min-height: 320px;
  }
  .hero-title {
    font-size: 34px;
    letter-spacing: 2px;
  }
}

.hero-waves {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.wave {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 200%;
  height: 100%;
}

.wave path {
  fill: var(--bg);
}

.wave-1 {
  opacity: 0.14;
  animation: wave-drift 28s linear infinite;
}

.wave-2 {
  opacity: 0.10;
  animation: wave-drift 36s linear infinite reverse;
  height: 90%;
}

.wave-3 {
  opacity: 0.06;
  animation: wave-drift 48s linear infinite;
  height: 80%;
}

@keyframes wave-drift {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
