<template>
  <div class="glass-card music-card">
    <h3 class="card-title-sm">🎵 音乐</h3>

    <!-- 播放中 -->
    <div v-if="player.hasTrack" class="player">
      <div class="player-cover">
        <el-image v-if="player.current?.cover" :src="player.current.cover" fit="cover">
          <template #error><div class="cover-fb">🎵</div></template>
        </el-image>
        <div v-else class="cover-fb">🎵</div>
      </div>

      <div class="player-info">
        <div class="player-title">{{ player.current?.title }}</div>
        <div class="player-artist">{{ player.current?.artist }}</div>
      </div>

      <div class="player-progress">
        <el-slider
          class="progress-slider"
          :model-value="player.currentTime"
          :max="Math.max(player.duration, 1)"
          :show-tooltip="false"
          @input="player.seek"
        />
        <div class="player-time">
          <span>{{ formatTime(player.currentTime) }}</span>
          <span>{{ formatTime(player.duration) }}</span>
        </div>
      </div>

      <div class="player-controls">
        <button class="p-btn" title="上一首" @click="player.prev()">
          <el-icon :size="16"><ArrowLeftBold /></el-icon>
        </button>
        <button class="p-btn play" :class="{ playing: player.playing }" :title="player.playing ? '暂停' : '播放'" @click="player.toggle()">
          <el-icon :size="18"><VideoPause v-if="player.playing" /><VideoPlay v-else /></el-icon>
        </button>
        <button class="p-btn" title="下一首" @click="player.next()">
          <el-icon :size="16"><ArrowRightBold /></el-icon>
        </button>
        <button class="p-btn" title="播放列表" @click="playlistOpen = true">
          <el-icon :size="16"><Tickets /></el-icon>
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="player-empty">
      <p>还没有播放歌曲</p>
      <el-button size="small" round @click="playAll">播放全部</el-button>
    </div>

    <router-link to="/music" class="music-more">打开音乐页 →</router-link>

    <!-- 播放列表抽屉 -->
    <!-- 播放列表抽屉 -->
    <el-drawer
      v-model="playlistOpen"
      direction="rtl"
      size="min(340px, 88vw)"
      :with-header="false"
      append-to-body
    >
      <div class="pl-head">
        <span class="pl-head-title">播放列表</span>
        <span class="pl-head-count">{{ player.queue.length }} 首</span>
      </div>

      <div v-if="player.queue.length" class="playlist">
        <div
          v-for="(t, i) in player.queue"
          :key="`${t.id}-${i}`"
          class="pl-item"
          :class="{ active: i === player.currentIndex }"
          @click="player.playAt(i)"
        >
          <span class="pl-index">
            <span v-if="i === player.currentIndex && player.playing" class="pl-bars"><i></i><i></i><i></i></span>
            <template v-else>{{ i + 1 }}</template>
          </span>

          <div class="pl-cover">
            <el-image v-if="t.cover" :src="t.cover" fit="cover">
              <template #error><span class="pl-cover-fb">🎵</span></template>
            </el-image>
            <span v-else class="pl-cover-fb">🎵</span>
          </div>

          <div class="pl-info">
            <div class="pl-title">{{ t.title }}</div>
            <div class="pl-meta">
              <span class="pl-artist">{{ t.artist }}</span>
              <span class="pl-duration">{{ formatTime(t.duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="pl-empty">
        <div class="pl-empty-icon">🎧</div>
        <p>播放列表是空的</p>
        <el-button size="small" round @click="playAll">播放全部</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeftBold, ArrowRightBold, VideoPlay, VideoPause, Tickets } from '@element-plus/icons-vue'
import { usePlayerStore } from '@/stores/player'
import { fetchMusicList } from '@/api/music'
import { formatTime } from '@/utils/format'

const player = usePlayerStore()
const playlistOpen = ref(false)

async function playAll() {
  const data = await fetchMusicList()
  player.playList(data.list, 0)
}
</script>

<style scoped>
.player-cover {
  width: 120px;
  height: 120px;
  margin: 0 auto 14px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.player-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.cover-fb {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 40px;
  background: var(--primary-soft);
}

.player-info {
  text-align: center;
  margin-bottom: 12px;
}

.player-title {
  font-size: var(--fs-body);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-artist {
  font-size: var(--fs-xs);
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-progress {
  margin-bottom: 10px;
}

.progress-slider {
  margin: 0;
}

.player-time {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-xs);
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
  margin-top: -8px;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.p-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--text-2);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background-color 0.2s, color 0.2s, transform 0.15s;
}

.p-btn:hover {
  background: var(--primary);
  color: #fff;
}

.p-btn:active {
  transform: scale(0.94);
}

.p-btn.play {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: #fff;
}

.p-btn.play.playing {
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--primary-soft);
  }
  50% {
    box-shadow: 0 0 0 6px transparent;
  }
}

.player-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.player-empty p {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.music-more {
  display: block;
  text-align: center;
  font-size: var(--fs-xs);
  color: var(--primary);
}

.music-more:hover {
  opacity: 0.75;
}

/* ── 播放列表抽屉 ── */
.pl-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-bottom: 14px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.pl-head-title {
  font-size: var(--fs-h3);
  font-weight: 700;
}

.pl-head-count {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.playlist {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pl-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.18s;
}

.pl-item:hover {
  background: var(--primary-soft);
}

/* 当前播放：左侧主题色竖条 + 高亮底 */
.pl-item.active {
  background: var(--primary-soft);
}

.pl-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 2px;
  background: var(--primary);
}

.pl-item.active .pl-title {
  color: var(--primary);
  font-weight: 600;
}

/* 序号 / 播放中的均衡器动画 */
.pl-index {
  width: 20px;
  flex-shrink: 0;
  text-align: center;
  color: var(--text-3);
  font-size: var(--fs-xs);
  font-variant-numeric: tabular-nums;
}

.pl-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.pl-bars i {
  width: 2px;
  border-radius: 1px;
  background: var(--primary);
  animation: plBar 0.9s ease-in-out infinite;
}

.pl-bars i:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}
.pl-bars i:nth-child(2) {
  height: 12px;
  animation-delay: 0.25s;
}
.pl-bars i:nth-child(3) {
  height: 8px;
  animation-delay: 0.5s;
}

@keyframes plBar {
  0%,
  100% {
    transform: scaleY(0.45);
  }
  50% {
    transform: scaleY(1);
  }
}

/* 封面缩略图 */
.pl-cover {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.pl-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
  display: block;
}

.pl-cover-fb {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 16px;
  background: var(--primary-soft);
}

.pl-info {
  flex: 1;
  min-width: 0;
}

.pl-title {
  font-size: var(--fs-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 第二行：歌手（可省略）+ 时长（固定），把整行宽度留给标题 */
.pl-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pl-artist {
  flex: 1;
  min-width: 0;
  font-size: var(--fs-xs);
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-duration {
  flex-shrink: 0;
  font-size: var(--fs-xs);
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

/* 空状态 */
.pl-empty {
  text-align: center;
  padding: 60px 0;
  color: var(--text-3);
}

.pl-empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.pl-empty p {
  font-size: var(--fs-sm);
  margin-bottom: 16px;
}
</style>
