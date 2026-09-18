import request from './request'

// 统一内容列表（首页 / 分类 / 标签筛选共用）
// params: { type, tag, keyword, sort, page, pageSize }
export function fetchContentList(params = {}) {
  return request.get('/content', { params })
}

// 内容详情（含 markdown 正文）
export function fetchContentDetail(id) {
  return request.get(`/content/${id}`)
}

// 新增内容（type=music 会写入音乐库，其余写入内容库）
export function createContent(data) {
  return request.post('/content', data)
}

// 修改内容
export function updateContent(id, data) {
  return request.put(`/content/${id}`, data)
}

// 删除内容
export function deleteContent(id) {
  return request.delete(`/content/${id}`)
}

// 标签列表（含计数）
export function fetchTags() {
  return request.get('/tags')
}

// 时间线数据（按时间倒序分组）
export function fetchTimeline(params = {}) {
  return request.get('/timeline', { params })
}
