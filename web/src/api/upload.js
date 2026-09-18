import request from './request'

// 图片上传：真实环境走 multipart/form-data；mock 模式返回占位 URL。
// 上传接口单独放宽超时（默认 15s 对稍大的文件不够用）。
export function uploadImage(file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 2 分钟
    onUploadProgress: onProgress
  })
}

// 视频上传（首页横幅等）：文件较大，不设超时，靠进度条反馈
export function uploadVideo(file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/upload/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0, // 0 = 不超时
    onUploadProgress: onProgress
  })
}

// 音频上传（音乐收藏）
export function uploadAudio(file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/upload/audio', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: onProgress
  })
}
