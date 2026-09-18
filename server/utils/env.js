// 加载 server/.env（若存在）到 process.env。
//
// 重要：本模块必须在 app.js 的**第一行**引入，且早于任何在模块顶层读取
// process.env 的模块（如 utils/auth.js 读 ADMIN_*、db/index.js 读 DB_FILE），
// 因为 ESM 会按 import 声明顺序求值，晚一步读到的就还是旧值。
//
// .env 已在 .gitignore 中排除，不会进仓库；没有该文件时静默跳过，走代码里的默认值。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENV_FILE = path.join(__dirname, '..', '.env')

if (fs.existsSync(ENV_FILE)) {
  if (typeof process.loadEnvFile !== 'function') {
    console.warn('[env] 当前 Node 不支持 process.loadEnvFile（需 20.12+），已跳过 .env')
  } else {
    try {
      process.loadEnvFile(ENV_FILE)
      console.log('[env] 已加载配置:', ENV_FILE)
    } catch (err) {
      console.warn('[env] 加载 .env 失败:', err.message)
    }
  }
}
