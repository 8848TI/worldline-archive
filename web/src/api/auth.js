import request from './request'

// 后台登录，成功返回 { token, username }
export function login(data) {
  return request.post('/auth/login', data)
}

// 校验当前 token 是否仍然有效
export function checkAuth() {
  return request.get('/auth/check')
}
