<template>
  <div class="tags">
    <h2 class="section-title">标签归档</h2>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="4" animated />
    </div>

    <template v-else>
      <div class="tag-cloud">
        <span
          v-for="t in tags"
          :key="t.name"
          class="tag-chip"
          :class="{ active: activeTag === t.name }"
          @click="toggleTag(t.name)"
        >
          {{ t.name }} <em>{{ t.count }}</em>
        </span>
      </div>

      <div v-if="activeTag" class="tag-result">
        <h3 class="tag-result-title"># {{ activeTag }}</h3>
        <div v-if="filtering" class="loading-wrap">
          <el-skeleton :rows="4" animated />
        </div>
        <div v-else-if="paged.length" class="card-grid">
          <ContentCard v-for="item in paged" :key="item.id" :item="item" @open="openItem" />
        </div>
        <EmptyState v-else text="这个标签下还没有内容" emoji="🏷️" />

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
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchTags, fetchContentList } from '@/api/content'
import { useItemNavigation } from '@/composables/useItemNavigation'
import { usePagination } from '@/composables/usePagination'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const { openItem } = useItemNavigation()

const tags = ref([])
const activeTag = ref('')
const filtered = ref([])
const loading = ref(true)
const filtering = ref(false)

// 标签结果分页
const { page, pageSize, total, paged } = usePagination(filtered, 12)

function toggleTag(name) {
  activeTag.value = activeTag.value === name ? '' : name
}

async function loadTagResult() {
  if (!activeTag.value) {
    filtered.value = []
    return
  }
  filtering.value = true
  try {
    const data = await fetchContentList({ tag: activeTag.value, pageSize: 50 })
    filtered.value = data.list
  } finally {
    filtering.value = false
  }
}

watch(activeTag, loadTagResult)

onMounted(async () => {
  try {
    const data = await fetchTags()
    tags.value = data.list
    // 支持从文章页跳转携带 ?tag=xxx
    if (route.query.tag) activeTag.value = String(route.query.tag)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-2);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.tag-chip em {
  font-style: normal;
  font-size: 12px;
  color: var(--text-3);
}

.tag-chip:hover {
  color: var(--text);
}

.tag-chip.active {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--primary-soft);
}

.tag-chip.active em {
  color: var(--primary);
}

.tag-result-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--text-2);
}
</style>
