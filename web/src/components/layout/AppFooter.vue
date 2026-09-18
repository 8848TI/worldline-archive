<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <p class="footer-motto">{{ site.motto }}</p>
      <p class="footer-icp">© 2026 {{ site.name }} · {{ site.icp }}</p>
    </div>
  </footer>
</template>

<script setup>
import { site } from '@/config/site'
</script>

<style scoped>
.app-footer {
  padding: 32px 0 40px;
}

.footer-inner {
  text-align: center;
}

.footer-motto {
  color: var(--text-2);
  font-size: var(--fs-sm);
  margin-bottom: 8px;
}

.footer-icp {
  color: var(--text-3);
  font-size: var(--fs-xs);
}
</style>
