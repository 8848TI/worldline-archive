<template>
  <div class="glass-card">
    <h3 class="card-title-sm">📊 站点统计</h3>
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-item">
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Array, default: () => [] }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 10px 4px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--text-3);
}
</style>
