<template>
  <!-- 无可见 UI，仅负责把 store 状态同步到全局音频引擎 -->
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { audio } from '@/utils/audio'
import { usePlayerStore, PLAYER_SAVE_KEY } from '@/stores/player'

const player = usePlayerStore()

function onTimeUpdate() {
  player.setProgress(audio.currentTime)
}

function onLoadedMeta() {
  // 用实际音频时长回填（含 queue 里 duration 为 0 的曲目）
  player.applyTrackDuration(audio.duration || player.current?.duration || 0)
}

function onEnded() {
  const before = player.currentIndex
  player.next()
  // 播放列表只有一首（或 next 绕回同一首）时音源 URL 不变，watcher 不会触发，需要手动重播
  if (player.currentIndex === before) {
    player.currentTime = 0
    audio.currentTime = 0
    if (player.playing) audio.play().catch(() => {})
  }
}

// 把当前队列与进度落到 localStorage。
// 注意用节流而不是防抖：timeupdate 每秒触发数次，防抖会被不断重置、永远不落盘。
let saveTimer = null
function scheduleSave() {
  if (saveTimer) return // 已有一次待写入，等它执行完再安排下一次
  saveTimer = setTimeout(() => {
    saveTimer = null
    try {
      localStorage.setItem(
        PLAYER_SAVE_KEY,
        JSON.stringify({
          queue: player.queue,
          currentIndex: player.currentIndex,
          currentTime: Math.floor(player.currentTime),
          volume: player.volume
        })
      )
    } catch {
      /* 隐私模式下写不了 localStorage，忽略 */
    }
  }, 1000)
}

onMounted(() => {
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('loadedmetadata', onLoadedMeta)
  audio.addEventListener('ended', onEnded)
  audio.volume = player.volume
  window.addEventListener('pagehide', scheduleSave)
})

onUnmounted(() => {
  audio.removeEventListener('timeupdate', onTimeUpdate)
  audio.removeEventListener('loadedmetadata', onLoadedMeta)
  audio.removeEventListener('ended', onEnded)
  window.removeEventListener('pagehide', scheduleSave)
})

// 切歌：更新音源并尝试播放。
// immediate: true —— 首屏就带上音源，这样刷新后恢复出来的曲目点播放能直接响
// （否则 URL 没变化，watcher 不触发，音频元素始终是空的）。
watch(
  () => player.current?.audioUrl,
  async (url) => {
    if (!url) return
    if (audio.getAttribute('src') !== url) {
      audio.src = url
      audio.load()
    }
    if (player.playing) {
      try {
        await audio.play()
      } catch (e) {
        /* 浏览器可能拦截自动播放，静默处理 */
      }
    }
  },
  { immediate: true }
)

// 播放 / 暂停联动
watch(
  () => player.playing,
  (val) => {
    if (val) audio.play().catch(() => {})
    else audio.pause()
    scheduleSave()
  }
)

// 队列、曲目、进度、音量变化都记录（防抖写入）
watch(
  () => [player.queue.length, player.currentIndex, Math.floor(player.currentTime), player.volume],
  scheduleSave
)
</script>
