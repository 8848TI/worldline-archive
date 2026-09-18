<template>
  <div class="category-chips">
    <button
      v-if="allowAll"
      class="chip"
      :class="{ active: !modelValue }"
      @click="$emit('update:modelValue', '')"
    >
      全部
    </button>
    <button
      v-for="c in list"
      :key="c.key"
      class="chip"
      :class="{ active: modelValue === c.key }"
      :style="{ '--chip-color': c.color }"
      @click="$emit('update:modelValue', c.key)"
    >
      <span class="chip-dot"></span>
      {{ c.label }}
    </button>
  </div>
</template>

<script setup>
import { CATEGORIES } from '@/constants/categories'

// 分类筛选 chips：modelValue 为当前选中的分类 key，'' 表示全部
defineProps({
  list: { type: Array, default: () => CATEGORIES },
  modelValue: { type: String, default: '' },
  allowAll: { type: Boolean, default: true }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-2);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s, transform 0.2s;
}

.chip:hover {
  color: var(--text);
  transform: translateY(-1px);
}

.chip.active {
  color: var(--text);
  border-color: var(--chip-color);
  background: var(--primary-soft);
  font-weight: 600;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip-color, var(--primary));
}
</style>
