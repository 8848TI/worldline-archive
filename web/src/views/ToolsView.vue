<template>
  <div class="tools">
    <div class="glass-card tools-head">
      <h2 class="tools-title">工具箱</h2>
      <p class="tools-sub">常用工具与链接收藏</p>
    </div>

    <div v-if="loading" class="glass-card"><el-skeleton :rows="4" animated /></div>

    <div v-else-if="list.length" class="tool-grid">
      <a
        v-for="t in list"
        :key="t.id"
        class="tool-card glass-card"
        :href="t.ext?.tool?.url || '#'"
        target="_blank"
        rel="noopener"
      >
        <h3 class="tool-name">{{ t.title }}</h3>
        <p class="tool-desc">{{ t.summary }}</p>
        <div class="tool-tags">
          <span v-for="tag in t.tags || []" :key="tag" class="tool-tag">{{ tag }}</span>
        </div>
      </a>
    </div>

    <EmptyState v-else text="还没有工具" emoji="🧰" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchContentList } from '@/api/content'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await fetchContentList({ type: 'tool', pageSize: 50 })
    list.value = data.list
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tools-head {
  margin-bottom: 16px;
}

.tools-title {
  font-size: var(--fs-h2);
  font-weight: 700;
}

.tools-sub {
  color: var(--text-3);
  font-size: var(--fs-sm);
  margin-top: 4px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tool-card {
  display: block;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.tool-name {
  font-size: var(--fs-h3);
  font-weight: 700;
  margin-bottom: 6px;
}

.tool-desc {
  font-size: var(--fs-sm);
  color: var(--text-2);
  line-height: 1.7;
  margin-bottom: 12px;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-tag {
  font-size: var(--fs-xs);
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
}

@media (max-width: 720px) {
  .tool-grid {
    grid-template-columns: 1fr;
  }
}
</style>
