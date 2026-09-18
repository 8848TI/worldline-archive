<template>
  <div class="music">
    <div class="music-head">
      <div class="music-cover">
        <el-image :src="cover" fit="cover">
          <template #error><div class="cover-fallback">🎵</div></template>
        </el-image>
      </div>
      <div class="music-info">
        <h2 class="section-title">BGM &amp; 好听音乐收藏</h2>
        <p class="music-count">共 {{ count }} 首</p>
        <el-button type="primary" round :disabled="!list.length" @click="playAll">
          <el-icon style="margin-right: 6px"><VideoPlay /></el-icon>播放全部
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="paged.length" class="track-list">
      <div
        v-for="(t, i) in paged"
        :key="t.id"
        class="track-item"
        :class="{ active: isCurrent(t) }"
        @click="playAt(t)"
      >
        <span class="track-index">{{ isCurrent(t) && playing ? '♪' : i + 1 }}</span>
        <el-image class="track-cover" :src="t.cover" fit="cover">
          <template #error><div class="track-cover-fb">🎵</div></template>
        </el-image>
        <div class="track-info">
          <div class="track-title">{{ t.title }}</div>
          <div class="track-artist">{{ t.artist }}<span v-if="t.album"> · {{ t.album }}</span></div>
        </div>
        <div class="track-tags">
          <span v-for="tag in (t.tags || []).slice(0, 2)" :key="tag" class="track-tag">{{ tag }}</span>
        </div>
        <span class="track-duration">{{ formatTime(t.duration) }}</span>
      </div>
    </div>
    <EmptyState v-else text="还没有收藏的音乐" emoji="🎵" />

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import { fetchMusicList } from '@/api/music'
import { usePlayerStore } from '@/stores/player'
import { usePagination } from '@/composables/usePagination'
import { formatTime } from '@/utils/format'
import { readDurationFromUrl } from '@/utils/mediaMeta'
import EmptyState from '@/components/common/EmptyState.vue'

const player = usePlayerStore()
const list = ref([])
const count = ref(0)
const loading = ref(true)

// 音乐列表分页
const { page, pageSize, total, paged } = usePagination(list, 10)

const cover = computed(() => list.value[0]?.cover || '')
const playing = computed(() => player.playing)

function isCurrent(t) {
  return player.current?.id === t.id
}

function playAll() {
  player.playList(list.value, 0)
}

function playAt(t) {
  const idx = list.value.findIndex((m) => m.id === t.id)
  if (idx >= 0) player.playList(list.value, idx)
}

// 老数据里 duration 为 0 的曲目：前端探测真实时长补全展示（不改动后端数据）
async function fillMissingDurations() {
  const targets = list.value.filter((t) => t.audioUrl && !t.duration)
  await Promise.all(
    targets.map(async (t) => {
      const d = await readDurationFromUrl(t.audioUrl)
      if (d) t.duration = d
    })
  )
}

onMounted(async () => {
  try {
    const data = await fetchMusicList()
    list.value = data.list
    count.value = data.total
    await fillMissingDurations()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.music-head {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 28px;
}

.music-cover {
  width: 160px;
  height: 160px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow);
}

.music-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.cover-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 48px;
  background: var(--primary-soft);
}

.music-info {
  flex: 1;
  min-width: 0;
}

.music-count {
  color: var(--text-3);
  font-size: 13px;
  margin: -10px 0 16px;
}

.track-list {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

.track-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.track-item + .track-item {
  border-top: 1px solid var(--border);
}

.track-item:hover {
  background: var(--primary-soft);
}

.track-item.active .track-title {
  color: var(--primary);
}

.track-index {
  width: 26px;
  text-align: center;
  color: var(--text-3);
  font-size: 14px;
  flex-shrink: 0;
}

.track-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.track-cover-fb {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  font-size: 18px;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-tags {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.track-tag {
  font-size: 12px;
  color: var(--text-2);
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--primary-soft);
}

.track-duration {
  font-size: 13px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  width: 44px;
  text-align: right;
}

@media (max-width: 640px) {
  .music-head {
    gap: 16px;
  }
  .music-cover {
    width: 96px;
    height: 96px;
  }
  .track-tags {
    display: none;
  }
  .track-item {
    padding: 10px 14px;
    gap: 10px;
  }
}
</style>
