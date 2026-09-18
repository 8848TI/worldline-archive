<template>
  <div class="empty-wrap">
    <div class="empty-emoji">{{ emoji }}</div>
    <p class="empty-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  emoji: { type: String, default: '🍃' },
  text: { type: String, default: '这里还什么都没有' }
})
</script>

<style scoped>
.empty-wrap {
  padding: 80px 0;
  text-align: center;
}

.empty-emoji {
  font-size: 44px;
  margin-bottom: 12px;
}

.empty-text {
  color: var(--text-3);
  font-size: 14px;
}
</style>
