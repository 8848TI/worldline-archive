import request from './request'

// 两级标签体系（大类 + 子小类）
export function fetchTagCategories() {
  return request.get('/tag-categories')
}

// 新增大类或子小类
// data: { name: '新大类' }  或  { parent: '动漫', name: '新子类' }
export function createTagCategory(data) {
  return request.post('/tag-categories', data)
}

// 删除大类（只传 name）或子小类（传 parent + name）
export function deleteTagCategory(params) {
  return request.delete('/tag-categories', { params })
}
