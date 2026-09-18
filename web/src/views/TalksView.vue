<template>
  <div class="talks">
    <div class="glass-card talks-head">
      <h2 class="talks-title">日常说说</h2>
      <p class="talks-sub">一些零碎的想法与日常记录</p>
    </div>

    <div v-if="loading" class="glass-card">
      <el-skeleton :rows="4" animated />
    </div>

    <template v-else-if="paged.length">
      <div class="talks-grid">
        <!-- 左列（1/3）：纯文字说说 -->
        <div class="talks-col">
          <article v-for="item in textTalks" :key="item.id" class="talk-item glass-card" @click="openItem(item)">
            <p class="talk-text">{{ item.summary }}</p>
            <div class="talk-meta">
              <span class="talk-date">{{ formatDate(item.createdAt) }}</span>
              <span v-for="t in item.tags" :key="t" class="talk-tag">#{{ t }}</span>
            </div>
          </article>
          <p v-if="!textTalks.length" class="talks-empty">暂无文字说说</p>
        </div>

        <!-- 右列（2/3）：带图说说 -->
        <div class="talks-col">
          <article
            v-for="item in imageTalks"
            :key="item.id"
            class="talk-item talk-item-image glass-card"
            @click="openItem(item)"
          >
            <div
              class="talk-images"
              :class="{ 'is-single': talkImages(item).length === 1 }"
              :style="{ gridTemplateColumns: `repeat(${talkImages(item).length}, 1fr)` }"
            >
              <img v-for="(src, k) in talkImages(item)" :key="k" :src="src" :alt="item.title" loading="lazy" />
            </div>
            <div class="talk-body">
              <p class="talk-text">{{ item.summary }}</p>
              <div class="talk-meta">
                <span class="talk-date">{{ formatDate(item.createdAt) }}</span>
                <span v-for="t in item.tags" :key="t" class="talk-tag">#{{ t }}</span>
              </div>
            </div>
          </article>
          <p v-if="!imageTalks.length" class="talks-empty">暂无带图说说</p>
        </div>
      </div>

      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
        />
      </div>
    </template>

    <EmptyState v-else text="还没有说说" emoji="✍️" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchContentList } from '@/api/content'
import { useItemNavigation } from '@/composables/useItemNavigation'
import { usePagination } from '@/composables/usePagination'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const { openItem } = useItemNavigation()
const list = ref([])
const loading = ref(true)

const { page, pageSize, total, paged } = usePagination(list, 12)

// 取说说的图片（优先 ext.article.images，回退到 cover），最多展示 3 张
function talkImages(item) {
  const imgs = item.ext?.article?.images
  if (Array.isArray(imgs) && imgs.length) return imgs.slice(0, 3)
  return item.cover ? [item.cover] : []
}

// 按是否带图分列：无图 → 左列，有图 → 右列
const textTalks = computed(() => paged.value.filter((i) => !talkImages(i).length))
const imageTalks = computed(() => paged.value.filter((i) => talkImages(i).length))

onMounted(async () => {
  try {
    const data = await fetchContentList({ type: 'essay', pageSize: 50 })
    list.value = data.list
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.talks-head {
  margin-bottom: 16px;
}

.talks-title {
  font-size: var(--fs-h2);
  font-weight: 700;
}

.talks-sub {
  color: var(--text-3);
  font-size: var(--fs-sm);
  margin-top: 4px;
}

/* 左 1/3 + 右 2/3 双列布局 */
.talks-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  align-items: start;
}

.talks-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.talk-item {
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.talk-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.talk-text {
  font-size: var(--fs-sm);
  line-height: 1.8;
  margin-bottom: 10px;
}

.talk-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.talk-date {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.talk-tag {
  font-size: var(--fs-xs);
  color: var(--primary);
}

/* 带图说说：整图 + 文字 */
.talk-item-image {
  padding: 0;
  overflow: hidden;
}

/* 多图网格：1 张时铺满，2~3 张并排 */
.talk-images {
  display: grid;
  gap: 6px;
  padding: 10px 10px 0;
}

.talk-images img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
  display: block;
  transition: transform 0.3s ease;
}

.talk-images.is-single img {
  aspect-ratio: 16 / 9;
}

.talk-item-image:hover .talk-images img {
  transform: scale(1.03);
}

.talk-body {
  padding: 14px 16px 16px;
}

.talks-empty {
  text-align: center;
  color: var(--text-3);
  font-size: var(--fs-xs);
  padding: 24px 0;
}

@media (max-width: 720px) {
  .talks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
