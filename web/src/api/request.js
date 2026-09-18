import axios from 'axios'
import { ElMessage } from 'element-plus/es/components/message/index'
import { getToken, clearAuth } from '@/utils/authToken'

// 是否启用 mock（默认开启，便于无后端预览；联调时把 .env 中 VITE_USE_MOCK 改为 false）
// 开关只在这里计算，真正的 mock 模块由 main.js 动态加载：
// 关闭 mock 时那份约 38KB 的演示数据不会被打进入口 chunk（构建后可用 dist 体积复核）。
const MOCK_FLAG = import.meta.env.VITE_USE_MOCK
export const USE_MOCK = (MOCK_FLAG === undefined ? 'true' : MOCK_FLAG) !== 'false'

// 统一的 axios 实例：所有接口请求都经由它发起，切真实后端时无需改动业务代码
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000
})

// 请求拦截：已登录时自动带上 token（写接口需要）
request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截：后端返回原始数据，这里统一把 response 解包为 data
request.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const msg = error?.response?.data?.message || error.message || '请求失败，请稍后重试'

    // 登录态失效：清掉本地 token 并回首页（登录接口自身的 401 只提示）
    if (status === 401 && !url.includes('/auth/login')) {
      clearAuth()
      ElMessage.warning('登录已过期，请重新登录')
      if (location.pathname.startsWith('/admin')) location.href = '/'
      return Promise.reject(error)
    }

    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

// 说明：mock 的挂载在 main.js 里做（动态 import），这里不再静态引入 mock 模块
export default request
