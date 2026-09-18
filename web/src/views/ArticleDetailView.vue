<template>
  <div class="article">
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="item">
      <article class="article-card">
        <header class="article-head">
          <div class="article-tags">
            <span class="type-badge" :style="{ background: cat.color }">{{ cat.emoji }} {{ cat.label }}</span>
            <span v-for="t in item.tags" :key="t" class="tag" @click="goTag(t)">#{{ t }}</span>
          </div>
          <h1 class="article-title">{{ item.title }}</h1>
          <div class="article-meta">
            <span>📅 {{ formatDate(item.createdAt) }}</span>
            <span v-if="item.ext?.article?.wordCount">⏱ 约 {{ formatDuration(item.ext.article.wordCount) }}</span>
          </div>
        </header>

        <div class="article-body markdown-body" v-html="html"></div>

        <!-- 正文配图：与卡片封面同源，点击可放大预览 -->
        <div
          v-if="images.length"
          class="article-images"
          :style="{ gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)` }"
        >
          <el-image
            v-for="(src, k) in images"
            :key="k"
            :src="src"
            fit="cover"
            :preview-src-list="images"
            :initial-index="k"
            :preview-teleported="true"
            class="article-image"
          />
        </div>
      </article>

      <div class="article-back">
        <el-button round @click="$router.back()">← 返回</el-button>
      </div>
    </template>

    <EmptyState v-else text="内容不存在或已被删除" emoji="🍃" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchContentDetail } from '@/api/content'
import { renderMarkdown } from '@/utils/markdown'
import { getCategory } from '@/constants/categories'
import { formatDate, formatDuration } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import 'highlight.js/styles/atom-one-dark.css'

const route = useRoute()
const router = useRouter()

const item = ref(null)
const loading = ref(true)

const cat = computed(() => getCategory(item.value?.type))
const html = computed(() => renderMarkdown(item.value?.ext?.article?.content))

// 正文配图：优先 ext.article.images，回退到封面
const images = computed(() => {
  const imgs = item.value?.ext?.article?.images
  if (Array.isArray(imgs) && imgs.length) return imgs
  return item.value?.cover ? [item.value.cover] : []
})

function goTag(tag) {
  router.push({ path: '/tags', query: { tag } })
}

onMounted(async () => {
  try {
    item.value = await fetchContentDetail(route.params.id)
  } catch (e) {
    item.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.article-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px 44px;
  max-width: 820px;
  margin: 0 auto;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
}

.tag {
  font-size: 13px;
  color: var(--primary);
  cursor: pointer;
}

.tag:hover {
  text-decoration: underline;
}

.article-title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.4;
  margin-bottom: 14px;
}

.article-meta {
  display: flex;
  gap: 18px;
  color: var(--text-3);
  font-size: 13px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--border);
}

.article-body {
  line-height: 1.8;
  font-size: 15px;
  color: var(--text);
}

/* 正文配图网格 */
.article-images {
  display: grid;
  gap: 10px;
  margin-top: 26px;
}

.article-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: zoom-in;
}

/* 只有一张图时用宽幅比例 */
.article-image:only-child {
  aspect-ratio: 16 / 9;
}

.article-back {
  max-width: 820px;
  margin: 24px auto 0;
}

@media (max-width: 640px) {
  .article-card {
    padding: 24px 20px;
  }
  .article-title {
    font-size: 22px;
  }
}
</style>
