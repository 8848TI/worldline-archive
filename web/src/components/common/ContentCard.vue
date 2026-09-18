<template>
  <!-- 海报式卡片（文娱集）：整图铺满 + 左上角状态 + 底部标题/标签 -->
  <article v-if="variant === 'poster'" class="content-card card-poster" @click="$emit('open', item)">
    <div class="poster-cover">
      <img v-if="item.cover && !imgError" :src="item.cover" :alt="item.title" loading="lazy" @error="imgError = true" />
      <span v-else class="poster-emoji">{{ cat.emoji }}</span>

      <!-- 底部渐变遮罩 + 标题 + 标签 -->
      <div class="poster-overlay">
        <h3 class="poster-title">{{ item.title }}</h3>
        <div class="poster-tags">
          <span v-for="t in (item.tags || []).slice(0, 3)" :key="t" class="poster-tag">#{{ t }}</span>
        </div>
      </div>
    </div>
  </article>

  <!-- 默认卡片（封面 + 正文） -->
  <article v-else class="content-card" @click="$emit('open', item)">
    <div class="card-cover" :style="coverStyle">
      <img v-if="item.cover && !imgError" :src="item.cover" :alt="item.title" loading="lazy" @error="imgError = true" />
      <span v-else class="cover-emoji">{{ cat.emoji }}</span>
      <span class="type-badge" :style="{ background: cat.color }">{{ cat.label }}</span>
      <span v-if="item.type === 'music'" class="play-hint">
        <el-icon :size="20"><VideoPlay /></el-icon>
      </span>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ item.title }}</h3>
      <p class="card-summary">{{ item.summary }}</p>
      <div class="card-foot">
        <div class="card-tags">
          <span v-for="t in (item.tags || []).slice(0, 2)" :key="t" class="tag">#{{ t }}</span>
        </div>
        <div class="card-meta">
          <span v-if="item.ext?.media?.rating" class="rating">★ {{ item.ext.media.rating }}</span>
          <span class="card-date">{{ formatDate(item.createdAt) }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import { getCategory } from '@/constants/categories'
import { formatDate } from '@/utils/format'

const props = defineProps({
  item: { type: Object, required: true },
  // 封面变体：默认 cover（封面+正文）；poster 为整图海报（文娱集用）
  variant: { type: String, default: 'cover' }
})

defineEmits(['open'])

const imgError = ref(false)
const cat = computed(() => getCategory(props.item.type))

// 默认卡片无封面时，用分类识别色的低饱和渐变占位
const coverStyle = computed(() => {
  if (props.item.cover && !imgError.value) return {}
  const c = cat.value.color
  return { background: `linear-gradient(135deg, ${c}33, ${c}0d)` }
})
</script>

<style scoped>
/* ── 基础卡片 ── */
.content-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: transparent;
}

/* ── 海报式卡片（整图） ── */
.card-poster {
  padding: 0;
}

.poster-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

.poster-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-poster:hover .poster-cover img {
  transform: scale(1.05);
}

.poster-emoji {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 48px;
  background: var(--primary-soft);
}

/* 底部渐变遮罩 + 标题 + 标签 */
.poster-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 46px 12px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.28) 55%, transparent 100%);
}

.poster-title {
  color: #fff;
  font-size: var(--fs-body);
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.poster-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.poster-tag {
  color: rgba(255, 255, 255, 0.92);
  font-size: var(--fs-xs);
}

/* ── 默认卡片：封面 ── */
.card-cover {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.content-card:hover .card-cover img {
  transform: scale(1.05);
}

.cover-emoji {
  font-size: 44px;
  opacity: 0.9;
}

.type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.play-hint {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.content-card:hover .play-hint {
  opacity: 1;
}

/* ── 默认卡片：正文 ── */
.card-body {
  padding: 14px 16px 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-summary {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.55;
  height: 2.9em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-tags {
  display: flex;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.tag {
  font-size: 12px;
  color: var(--primary);
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.rating {
  font-size: 12px;
  color: #e8a94d;
  font-weight: 600;
}

.card-date {
  font-size: 12px;
  color: var(--text-3);
  white-space: nowrap;
}
</style>
