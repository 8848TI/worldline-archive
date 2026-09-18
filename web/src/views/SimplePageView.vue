<template>
  <div class="simple-page">
    <div class="glass-card simple-card">
      <h2 class="simple-title">{{ meta.title }}</h2>
      <p class="simple-text">{{ meta.text }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// 页面标题与文案来自路由 meta，便于用同一个组件支撑多个占位页
const meta = computed(() => ({
  title: route.meta.title || '建设中',
  text: route.meta.description || '这个页面正在建设中，敬请期待。'
}))
</script>

<style scoped>
.simple-card {
  text-align: center;
  padding: 60px 30px;
}

.simple-title {
  font-size: var(--fs-h2);
  font-weight: 700;
  margin-bottom: 14px;
}

.simple-text {
  color: var(--text-2);
  font-size: var(--fs-body);
  line-height: 1.7;
}
</style>
