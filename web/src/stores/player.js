import { defineStore } from 'pinia'
import { audio } from '@/utils/audio'

// 将「内容条目」或「音乐条目」归一化为播放器所需的曲目结构，
// 兼容 /content 中的 type=music（ext.music）与 /music 的原始结构两种形态。
function normalize(item) {
  if (!item) return null
  const m = item.ext?.music || item
  return {
    id: item.id,
    title: item.title,
    artist: m.artist || item.artist || '未知歌手',
    cover: item.cover || m.cover || '',
    audioUrl: m.audioUrl || item.audioUrl || '',
    duration: m.duration || item.duration || 0
  }
}

// 全局播放器状态：管理播放队列、当前曲目与播放控制。
// 刷新页面后恢复上次的播放队列与进度：存 localStorage，恢复后处于暂停态
// （浏览器本来也不允许无交互自动播放），用户点播放即可从原位置继续。
export const PLAYER_SAVE_KEY = 'worldline-player'

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(PLAYER_SAVE_KEY) || 'null')
    if (s && Array.isArray(s.queue) && s.queue.length && s.currentIndex >= 0 && s.currentIndex < s.queue.length) return s
  } catch {
    /* 数据坏了就当没有 */
  }
  return null
}

// 实际的 <audio> 由 utils/audio.js 提供单例，AudioEngine 组件负责把 store 状态同步到音频。
export const usePlayerStore = defineStore('player', {
  state: () => {
    const saved = loadSaved()
    return {
      queue: saved?.queue || [], // 归一化后的播放队列
      currentIndex: saved ? saved.currentIndex : -1, // 当前曲目下标
      playing: false,
      currentTime: saved?.currentTime || 0,
      duration: 0,
      volume: saved?.volume ?? 0.8
    }
  },
  getters: {
    current: (state) => state.queue[state.currentIndex] || null,
    hasTrack: (state) => state.currentIndex >= 0 && state.currentIndex < state.queue.length
  },
  actions: {
    // 播放一个曲目列表，从指定下标开始
    // 重复点击当前这首时不重置进度（避免"点一下就从头播"），只有播完了才重新开始
    playList(list, startIndex = 0) {
      const q = (list || []).map(normalize).filter((t) => t && t.audioUrl)
      if (!q.length) return
      const idx = Math.min(Math.max(startIndex, 0), q.length - 1)
      const isSameTrack = this.current && q[idx] && this.current.id === q[idx].id
      const ended = isSameTrack && this.duration > 0 && this.currentTime >= this.duration - 0.5

      this.queue = q
      this.currentIndex = idx
      this.playing = true

      if (!isSameTrack) {
        this.currentTime = 0
        this.duration = 0
      } else if (ended) {
        // 播完的这首再来一遍：音源 URL 没变，AudioEngine 的 watcher 不会触发，这里直接操作音频
        this.currentTime = 0
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
    },
    toggle() {
      this.playing = !this.playing
    },
    next() {
      if (!this.queue.length) return
      this.currentIndex = (this.currentIndex + 1) % this.queue.length
      this.currentTime = 0
    },
    prev() {
      if (!this.queue.length) return
      this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length
      this.currentTime = 0
    },
    playAt(index) {
      if (index < 0 || index >= this.queue.length) return
      // 点当前这首：延续播放状态，不从头开始
      if (index === this.currentIndex) {
        this.playing = true
        // 已经播完的，重新从头播放
        if (this.duration > 0 && this.currentTime >= this.duration - 0.5) {
          this.currentTime = 0
          audio.currentTime = 0
          audio.play().catch(() => {})
        }
        return
      }
      this.currentIndex = index
      this.playing = true
      this.currentTime = 0
    },
    setProgress(time) {
      this.currentTime = time
    },
    setDuration(dur) {
      this.duration = dur
    },
    // 音频元数据加载后回填时长：老数据里 duration 为 0 的曲目会自动修复
    applyTrackDuration(dur) {
      const d = Number(dur) || 0
      if (!d) return
      this.duration = d
      const cur = this.current
      if (cur && !cur.duration) cur.duration = d
    },
    // 拖动进度条：直接操作音频并同步状态
    seek(time) {
      audio.currentTime = time
      this.currentTime = time
    },
    setVolume(v) {
      this.volume = v
      audio.volume = v
    },
    clear() {
      this.queue = []
      this.currentIndex = -1
      this.playing = false
      this.currentTime = 0
      this.duration = 0
      audio.pause()
      audio.removeAttribute('src')
    }
  }
})
