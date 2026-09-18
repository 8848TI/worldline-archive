<template>
  <!-- 无可见 UI，仅负责把 store 状态同步到全局音频引擎 -->
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { audio } from '@/utils/audio'
import { usePlayerStore } from '@/stores/player'

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

onMounted(() => {
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('loadedmetadata', onLoadedMeta)
  audio.addEventListener('ended', onEnded)
  audio.volume = player.volume
})

onUnmounted(() => {
  audio.removeEventListener('timeupdate', onTimeUpdate)
  audio.removeEventListener('loadedmetadata', onLoadedMeta)
  audio.removeEventListener('ended', onEnded)
})

// 切歌：更新音源并尝试播放
watch(
  () => player.current?.audioUrl,
  async (url) => {
    if (!url) return
    audio.src = url
    audio.load()
    if (player.playing) {
      try {
        await audio.play()
      } catch (e) {
        /* 浏览器可能拦截自动播放，静默处理 */
      }
    }
  }
)

// 播放 / 暂停联动
watch(
  () => player.playing,
  (val) => {
    if (val) audio.play().catch(() => {})
    else audio.pause()
  }
)
</script>
