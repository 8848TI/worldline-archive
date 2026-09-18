import request from './request'

// 壁纸图片列表（瀑布流）
export function fetchWallpapers(params = {}) {
  return request.get('/wallpapers', { params })
}
