<template>
  <div class="timeline">
    <div class="timeline-head">
      <h2 class="section-title">时间线归档</h2>
      <el-select v-model="year" clearable placeholder="全部年份" style="width: 140px" size="default">
        <el-option v-for="y in years" :key="y" :label="`${y} 年`" :value="y" />
      </el-select>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="paged.length" class="timeline-body">
      <div v-for="group in paged" :key="group.date" class="tl-group">
        <div class="tl-date">{{ group.date }}</div>
        <div class="tl-items">
          <div v-for="item in group.items" :key="item.id" class="tl-item" @click="openItem(item)">
            <span class="tl-dot" :style="{ background: getCategory(item.type).color }"></span>
            <span class="tl-type">{{ getCategory(item.type).emoji }} {{ getCategory(item.type).label }}</span>
            <span class="tl-title">{{ item.title }}</span>
            <span class="tl-summary">{{ item.summary }}</span>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else text="这个年份下还没有记录" emoji="🕰️" />

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
import { ref, watch } from 'vue'
import { fetchTimeline } from '@/api/content'
import { useItemNavigation } from '@/composables/useItemNavigation'
import { usePagination } from '@/composables/usePagination'
import { getCategory } from '@/constants/categories'
import EmptyState from '@/components/common/EmptyState.vue'

const { openItem } = useItemNavigation()

const groups = ref([])
const years = ref([])
const year = ref(null)
const loading = ref(false)

// 时间线分组分页
const { page, pageSize, total, paged } = usePagination(groups, 10)

async function load() {
  loading.value = true
  try {
    const data = await fetchTimeline({ year: year.value || undefined })
    groups.value = data.groups
    years.value = data.years
  } finally {
    loading.value = false
  }
}

watch(year, load)
load()
</script>

<style scoped>
.timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 8px;
}

.timeline-body {
  position: relative;
  padding-left: 22px;
}

/* 左侧竖向时间轴 */
.timeline-body::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border);
}

.tl-group {
  position: relative;
  margin-bottom: 28px;
}

.tl-date {
  position: relative;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-2);
  margin-bottom: 14px;
  padding-left: 14px;
}

.tl-date::before {
  content: '';
  position: absolute;
  left: -22px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--primary);
}

.tl-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tl-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.tl-item:hover {
  transform: translateX(4px);
  border-color: transparent;
  box-shadow: var(--shadow);
}

.tl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tl-type {
  font-size: 12px;
  color: var(--text-2);
  white-space: nowrap;
  flex-shrink: 0;
}

.tl-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  max-width: 240px;
}

.tl-summary {
  font-size: 13px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .tl-summary {
    display: none;
  }
  .tl-title {
    max-width: none;
    flex: 1;
  }
}
</style>
