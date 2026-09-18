<template>
  <div class="projects">
    <div v-if="loading" class="glass-card"><el-skeleton :rows="5" animated /></div>

    <template v-else-if="list.length">
      <a
        v-for="p in list"
        :key="p.id"
        class="project-card glass-card"
        :href="p.ext?.project?.url || '#'"
        target="_blank"
        rel="noopener"
      >
        <div class="project-head">
          <h3 class="project-title">{{ p.title }}</h3>
          <!-- GitHub 标识 -->
          <svg class="github-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </div>
        <p class="project-desc">{{ p.summary }}</p>
        <div class="project-tags">
          <span v-for="t in p.tags || []" :key="t" class="tech-tag">{{ t }}</span>
        </div>
      </a>
    </template>

    <EmptyState v-else text="还没有项目" emoji="📦" />
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
    const data = await fetchContentList({ type: 'project', pageSize: 50 })
    list.value = data.list
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.projects {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-card {
  display: block;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.project-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.project-title {
  font-size: var(--fs-h2);
  font-weight: 700;
  color: var(--text);
}

.github-icon {
  color: var(--text-3);
  flex-shrink: 0;
  transition: color 0.2s;
}

.project-card:hover .github-icon {
  color: var(--text);
}

.project-desc {
  font-size: var(--fs-sm);
  color: var(--text-2);
  line-height: 1.7;
  margin-bottom: 12px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  font-size: var(--fs-xs);
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
}
</style>
