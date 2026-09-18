// 登录态的本地存储（纯 localStorage，不依赖 axios，避免循环引用）
const TOKEN_KEY = 'worldline-token'
const USER_KEY = 'worldline-user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getUsername() {
  return localStorage.getItem(USER_KEY) || ''
}

export function isLoggedIn() {
  return !!getToken()
}

export function setAuth(token, username) {
  localStorage.setItem(TOKEN_KEY, token)
  if (username) localStorage.setItem(USER_KEY, username)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
