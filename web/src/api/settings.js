import request from './request'

// 站点设置（首页横幅视频等）
export function fetchSettings() {
  return request.get('/settings')
}

// 更新站点设置（浅合并，只传要改的字段）
export function updateSettings(data) {
  return request.put('/settings', data)
}
