<template>
  <div class="glass-card">
    <h3 class="card-title-sm">📚 文章分类</h3>
    <ul class="cat-list">
      <li
        v-for="c in categories"
        :key="c.key"
        class="cat-item"
        :class="{ active: active === c.key }"
        @click="$emit('select', c.key)"
      >
        <span class="cat-emoji">{{ c.emoji }}</span>
        <span class="cat-label">{{ c.label }}</span>
        <span class="cat-count">{{ c.count }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  active: { type: String, default: '' }
})

defineEmits(['select'])
</script>

<style scoped>
.cat-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--fs-sm);
  color: var(--text-2);
  transition: background-color 0.2s, color 0.2s;
}

.cat-item:hover {
  background: var(--primary-soft);
  color: var(--text);
}

.cat-item.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}

.cat-emoji {
  flex-shrink: 0;
}

.cat-label {
  flex: 1;
}

.cat-count {
  font-size: var(--fs-xs);
  color: var(--text-3);
}
</style>
