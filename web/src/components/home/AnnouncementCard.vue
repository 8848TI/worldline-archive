<template>
  <div class="glass-card">
    <h3 class="card-title-sm">📢 公告</h3>
    <p class="announce-text">{{ site.announcement }}</p>
  </div>
</template>

<script setup>
import { site } from '@/config/site'
</script>

<style scoped>
.announce-text {
  font-size: var(--fs-xs);
  color: var(--text-2);
  line-height: 1.7;
}
</style>
