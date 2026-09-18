<template>
  <div class="wallpaper">
    <h2 class="section-title">好看的壁纸插画</h2>
    <p class="wallpaper-sub">国漫 · 日漫 · 港风，收藏的精美插画合集，点击可预览大图</p>

    <div class="wallpaper-tabs" role="tablist">
      <button
        class="tab"
        :class="{ active: !category }"
        role="tab"
        :aria-selected="!category"
        @click="category = ''"
      >
        <span class="tab-label">全部</span>
        <span class="tab-count">{{ allCount }}</span>
        <span class="tab-underline" aria-hidden="true"></span>
      </button>
      <button
        v-for="c in categories"
        :key="c"
        class="tab"
        :class="{ active: category === c }"
        role="tab"
        :aria-selected="category === c"
        @click="category = category === c ? '' : c"
      >
        <span class="tab-label">{{ c }}</span>
        <span class="tab-count">{{ catCount(c) }}</span>
        <span class="tab-underline" aria-hidden="true"></span>
      </button>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="paged.length" class="waterfall">
      <div
        v-for="(img, i) in paged"
        :key="img.id"
        class="waterfall-item"
        :style="{ aspectRatio: `${img.width || 800} / ${img.height || 1000}` }"
      >
        <el-image
          :src="gridSrc(img)"
          lazy
          :preview-src-list="previewList"
          :initial-index="(page - 1) * pageSize + i"
          :preview-teleported="true"
          fit="cover"
          class="waterfall-img"
          @error="onGridError(img)"
        >
          <template #error><div class="img-fallback">🖼️</div></template>
        </el-image>
        <div class="waterfall-mask">
          <el-icon :size="22"><ZoomIn /></el-icon>
        </div>
      </div>
    </div>
    <EmptyState v-else text="暂无壁纸" emoji="🖼️" />

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ZoomIn } from '@element-plus/icons-vue'
import { fetchWallpapers } from '@/api/wallpaper'
import { usePagination } from '@/composables/usePagination'
import { thumbUrl } from '@/utils/imageUrl'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(true)
const category = ref('') // '' 表示全部

const categories = ['国漫', '日漫', '港风']

const allCount = computed(() => list.value.length)

// 兼容两种标签写法：'国漫' 与 '壁纸/国漫'
function hasCat(tags, c) {
  return (tags || []).some((t) => t === c || String(t).endsWith(`/${c}`))
}

function catCount(c) {
  return list.value.filter((i) => hasCat(i.tags, c)).length
}

const filtered = computed(() => {
  if (!category.value) return list.value
  return list.value.filter((i) => hasCat(i.tags, category.value))
})

const { page, pageSize, total, paged } = usePagination(filtered, 12)

const previewList = computed(() => filtered.value.map((i) => i.url))

// 瀑布流用缩略图（体积通常只有原图几十分之一），点开预览仍用原图；
// 缩略图取不到时退回原图，避免历史文件没生成缩略图时显示不出来。
const thumbFailed = ref(new Set())
function gridSrc(img) {
  return thumbFailed.value.has(img.id) ? img.url : thumbUrl(img.url)
}
function onGridError(img) {
  if (!thumbFailed.value.has(img.id)) thumbFailed.value = new Set(thumbFailed.value).add(img.id)
}

onMounted(async () => {
  try {
    const data = await fetchWallpapers()
    list.value = data.list
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.wallpaper-sub {
  color: var(--text-3);
  font-size: 13px;
  margin-top: -14px;
  margin-bottom: 22px;
}

/* ── 下划线式分类 Tabs ── */
.wallpaper-tabs {
  display: inline-flex;
  align-items: stretch;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  padding: 0 6px;
  margin-bottom: 18px;
}

.tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px 12px;
  border: none;
  background: transparent;
  color: var(--text-2);
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.tab:hover {
  color: var(--text);
}

.tab-label {
  letter-spacing: 0.3px;
}

.tab.active {
  color: var(--primary);
  font-weight: 700;
}

.tab-count {
  font-size: 12px;
  line-height: 1;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
  transition: background-color 0.2s, color 0.2s;
}

.tab.active .tab-count {
  background: var(--primary);
  color: #fff;
}

.tab-underline {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--primary);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab.active .tab-underline {
  transform: scaleX(1);
}

/* CSS columns 瀑布流：卡片按图片比例自适应高度，兼容手机竖屏与电脑横屏壁纸 */
.waterfall {
  column-count: 3;
  column-gap: 16px;
}

.waterfall-item {
  position: relative;
  break-inside: avoid;
  margin-bottom: 16px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.waterfall-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: transparent;
}

.waterfall-img {
  width: 100%;
  height: 100%;
  display: block;
}

.waterfall-item :deep(.el-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.waterfall-item:hover :deep(.el-image img) {
  transform: scale(1.06);
}

/* hover 遮罩：提示可点击预览 */
.waterfall-mask {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.22);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.waterfall-item:hover .waterfall-mask {
  opacity: 1;
}

.img-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 32px;
  background: var(--primary-soft);
}

@media (max-width: 720px) {
  .tab {
    padding: 10px 12px 12px;
  }
  .tab-underline {
    left: 12px;
    right: 12px;
  }
  .waterfall {
    column-count: 2;
    column-gap: 10px;
  }
  .waterfall-item {
    margin-bottom: 10px;
  }
}

@media (max-width: 1024px) and (min-width: 721px) {
  .waterfall {
    column-count: 2;
  }
}
</style>
