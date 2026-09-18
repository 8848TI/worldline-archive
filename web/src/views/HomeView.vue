<template>
  <div class="home">
    <div class="center-head glass-card">
      <h2 class="center-title">文章</h2>
      <div class="center-tools">
        <span v-if="filter.category || filter.tag || filter.keyword" class="filter-chip" @click="filter.clear()">清除筛选 ✕</span>
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">列表</button>
          <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">网格</button>
        </div>
      </div>
    </div>

    <div v-if="content.loading" class="glass-card">
      <el-skeleton :rows="6" animated />
    </div>

    <transition-group
      v-else-if="paged.length"
      name="list"
      tag="div"
      :class="viewMode === 'list' ? 'article-list' : 'article-grid'"
    >
      <article v-for="item in paged" :key="item.id" class="article-item glass-card" @click="openItem(item)">
        <span class="type-badge" :style="{ color: getCategory(item.type).color }">
          {{ getCategory(item.type).emoji }} {{ getCategory(item.type).label }}
        </span>
        <h3 class="article-title">{{ item.title }}</h3>
        <p class="article-summary">{{ item.summary }}</p>
        <div class="article-meta">
          <span class="article-date">{{ formatDate(item.createdAt) }}</span>
          <span v-for="t in item.tags" :key="t" class="article-tag">#{{ t }}</span>
        </div>
      </article>
    </transition-group>

    <EmptyState v-else text="没有找到相关文章" emoji="🍃" />

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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ARTICLE_TYPES, getCategory } from '@/constants/categories'
import { useContentStore } from '@/stores/content'
import { useFilterStore } from '@/stores/filter'
import { useItemNavigation } from '@/composables/useItemNavigation'
import { usePagination } from '@/composables/usePagination'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const content = useContentStore()
const filter = useFilterStore()
const { openItem } = useItemNavigation()

const viewMode = ref('list')

// 中心文章列表：随笔 + 代码，支持分类 / 标签 / 关键词过滤
const articles = computed(() => {
  let list = content.all.filter((i) => ARTICLE_TYPES.includes(i.type))
  if (filter.category) list = list.filter((i) => i.type === filter.category)
  if (filter.tag) list = list.filter((i) => (i.tags || []).includes(filter.tag))
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase()
    // 与后端 /api/content?keyword= 保持一致：正文也参与匹配
    const textOf = (i) => `${i.title}${i.summary}${i.ext?.article?.content || ''}`
    list = list.filter((i) => textOf(i).toLowerCase().includes(kw))
  }
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 文章列表分页
const { page, pageSize, total, paged } = usePagination(articles, 8)

// 导航搜索跳转的 ?q= 参数同步到筛选状态
watch(
  () => route.query.q,
  (q) => filter.setKeyword(q),
  { immediate: true }
)

// 回到首页时强制刷新内容，避免后台新增/修改后看到的还是旧数据
onMounted(() => {
  if (content.loaded) content.load(true)
})
</script>

<style scoped>
.center-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.center-title {
  font-size: var(--fs-h2);
  font-weight: 700;
}

.center-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-chip {
  font-size: var(--fs-xs);
  color: var(--primary);
  cursor: pointer;
}

.filter-chip:hover {
  opacity: 0.75;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.view-toggle button {
  border: none;
  background: transparent;
  color: var(--text-2);
  font-size: var(--fs-xs);
  padding: 5px 14px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.view-toggle button.active {
  background: var(--primary);
  color: #fff;
}

.article-list {
  display: flex;
  flex-direction: column;
}

.article-list .article-item {
  margin-bottom: 12px;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.article-item {
  padding: 18px 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.article-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.type-badge {
  font-size: var(--fs-xs);
  font-weight: 600;
}

.article-title {
  font-size: var(--fs-h3);
  font-weight: 600;
  margin: 8px 0 6px;
  transition: color 0.2s;
}

.article-item:hover .article-title {
  color: var(--primary);
}

.article-summary {
  font-size: var(--fs-sm);
  color: var(--text-2);
  line-height: 1.7;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.article-date {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.article-tag {
  font-size: var(--fs-xs);
  color: var(--primary);
}

@media (max-width: 720px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
