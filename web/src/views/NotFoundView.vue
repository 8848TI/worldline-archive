<template>
  <div class="container not-found">
    <div class="nf-code">404</div>
    <p class="nf-text">这条世界线似乎不存在</p>
    <el-button type="primary" round @click="$router.push('/')">回到首页</el-button>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  text-align: center;
  padding: 120px 0;
}

.nf-code {
  font-size: 80px;
  font-weight: 800;
  background: linear-gradient(120deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 12px;
}

.nf-text {
  color: var(--text-3);
  margin-bottom: 24px;
}
</style>
