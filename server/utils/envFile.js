import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENV_FILE = path.join(__dirname, '..', '.env')

// 给脚本用：读 server/.env 并与命令行环境变量合并（命令行优先）。
// 应用本身走 utils/env.js + process.loadEnvFile，不需要这个。
export function readEnv() {
  const fromFile = {}
  if (fs.existsSync(ENV_FILE)) {
    for (const line of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
      if (line.trim().startsWith('#')) continue
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) fromFile[m[1]] = m[2].trim()
    }
  }
  return { ...fromFile, ...process.env }
}
