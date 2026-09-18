import request from './request'

// 音乐列表（音乐页 + 全局播放器共用）
export function fetchMusicList(params = {}) {
  return request.get('/music', { params })
}

// 单曲详情
export function fetchMusicDetail(id) {
  return request.get(`/music/${id}`)
}
