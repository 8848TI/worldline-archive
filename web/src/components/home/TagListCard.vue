<template>
  <div class="glass-card">
    <h3 class="card-title-sm">🏷 文章标签</h3>
    <div class="tag-cloud">
      <span
        v-for="t in tags"
        :key="t.name"
        class="tag-chip"
        :class="{ active: active === t.name }"
        @click="$emit('select', t.name)"
      >
        {{ t.name }}<em>{{ t.count }}</em>
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tags: { type: Array, default: () => [] },
  active: { type: String, default: '' }
})

defineEmits(['select'])
</script>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--fs-xs);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.tag-chip em {
  font-style: normal;
  color: var(--text-3);
}

.tag-chip:hover {
  color: var(--text);
}

.tag-chip.active {
  color: var(--primary);
  background: var(--primary-soft);
}

.tag-chip.active em {
  color: var(--primary);
}
</style>
