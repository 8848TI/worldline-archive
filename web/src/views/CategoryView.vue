<template>
  <div class="category">
    <h2 class="section-title">好看的影视</h2>
    <p class="category-sub">动漫 · 电影 · 剧集 · 漫画，好看的都在这里</p>

    <div class="toolbar">
      <div class="media-tabs" role="tablist">
        <button
          v-for="c in mediaList"
          :key="c.key"
          role="tab"
          class="tab"
          :class="{ active: activeType === c.key }"
          :aria-selected="activeType === c.key"
          @click="activeType = c.key"
        >
          <span class="tab-label">{{ c.label }}</span>
          <span class="tab-count">{{ typeCounts[c.key] ?? 0 }}</span>
          <span class="tab-underline" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="paged.length" class="card-grid">
      <ContentCard v-for="item in paged" :key="item.id" :item="item" variant="poster" @open="openDetail" />
    </div>
    <EmptyState v-else text="这个分类下还没有内容" emoji="🍥" />

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
      />
    </div>

    <!-- 媒体详情弹窗：遮罩全屏 + 毛玻璃 -->
    <el-dialog v-model="detailOpen" width="720px" align-center append-to-body modal-class="blur-modal">
      <div v-if="detail" class="detail">
        <div class="detail-cover">
          <img v-if="detail.cover" :src="detail.cover" :alt="detail.title" />
          <span v-else class="detail-emoji">{{ cat(detail.type).emoji }}</span>
        </div>
        <div class="detail-info">
          <h3 class="detail-title">{{ detail.title }}</h3>
          <p v-if="detail.ext?.media?.year" class="detail-line">年份：{{ detail.ext.media.year }}</p>
          <p v-if="episodeText(detail)" class="detail-line">集数：{{ episodeText(detail) }}</p>
          <div class="detail-tags">
            <span v-for="t in detail.tags" :key="t" class="detail-tag">#{{ t }}</span>
          </div>
          <p class="detail-summary">简介：{{ detail.summary }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchContentList } from '@/api/content'
import { usePagination } from '@/composables/usePagination'
import { CATEGORIES, MEDIA_TYPES, getCategory } from '@/constants/categories'
import { useContentStore } from '@/stores/content'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const content = useContentStore()
const cat = getCategory

const mediaList = CATEGORIES.filter((c) => MEDIA_TYPES.includes(c.key))

const typeCounts = computed(() => {
  const counts = {}
  for (const t of MEDIA_TYPES) counts[t] = 0
  for (const i of content.all) if (counts[i.type] != null) counts[i.type]++
  return counts
})

const activeType = ref(MEDIA_TYPES.includes(route.params.type) ? route.params.type : MEDIA_TYPES[0])

const list = ref([])
const loading = ref(false)
const detailOpen = ref(false)
const detail = ref(null)

const { page, pageSize, total, paged } = usePagination(list, 12)

async function load() {
  loading.value = true
  try {
    const data = await fetchContentList({
      type: activeType.value,
      pageSize: 24
    })
    list.value = data.list
  } finally {
    loading.value = false
  }
}

function openDetail(item) {
  detail.value = item
  detailOpen.value = true
}

// 集数显示：电影算 1 话，其余用 episodes；没有则整行隐藏
function episodeText(item) {
  const m = item.ext?.media
  if (!m) return ''
  if (m.episodes) return `${m.episodes} 话`
  if (item.type === 'movie') return '1 话'
  return ''
}

watch(activeType, load)
watch(
  () => route.params.type,
  (t) => {
    if (MEDIA_TYPES.includes(t)) activeType.value = t
  }
)

load()
</script>

<style scoped>
.category-sub {
  color: var(--text-3);
  font-size: 13px;
  margin-top: -14px;
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 24px;
}

/* ── 下划线式分类 Tabs ── */
.media-tabs {
  display: inline-flex;
  align-items: stretch;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  padding: 0 6px;
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

.detail {
  display: flex;
  gap: 24px;
}

.detail-cover {
  width: 240px;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--primary-soft);
  display: grid;
  place-items: center;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-emoji {
  font-size: 48px;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-size: var(--fs-h2);
  font-weight: 700;
  margin-bottom: 12px;
}

.detail-line {
  font-size: var(--fs-sm);
  color: var(--text-2);
  line-height: 1.9;
  margin-bottom: 8px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 20px;
}

.detail-summary {
  color: var(--text-2);
  font-size: var(--fs-sm);
  line-height: 1.9;
}

.detail-tag {
  font-size: var(--fs-xs);
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
}

@media (max-width: 560px) {
  .detail {
    flex-direction: column;
  }
  .detail-cover {
    width: 120px;
  }
  .tab {
    padding: 10px 12px 12px;
  }
  .tab-underline {
    left: 12px;
    right: 12px;
  }
}
</style>
