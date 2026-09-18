// 备份 SQLite 数据库：用 VACUUM INTO 生成一致性快照（服务在跑也能备，不用停服），
// 备份完立刻打开校验一次行数，然后按保留份数清理最旧的备份。
//
// 运行：npm run db:backup
// 建议：加到定时任务里，例如每天凌晨 3 点（Windows 用 schtasks，Linux 用 crontab）
//   Linux:   0 3 * * *  cd /path/to/server && npm run db:backup >> logs/backup.log 2>&1
//   Windows: schtasks /create /tn worldline-backup /tr "cmd /c cd /d E:\path\server && npm run db:backup" /sc daily /st 03:00
import fs from 'node:fs'
import path from 'node:path'
import sqlite from 'node-sqlite3-wasm'
import { db, DB_FILE, closeDb, tableCounts } from '../db/index.js'

const KEEP = Number(process.env.BACKUP_KEEP) || 14
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(path.dirname(DB_FILE), 'backups')

fs.mkdirSync(BACKUP_DIR, { recursive: true })

const stamp = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19)
const target = path.join(BACKUP_DIR, `worldline_${stamp}.db`)

const before = tableCounts()
console.log('[backup] 数据库:', DB_FILE)
console.log('[backup] 当前行数:', JSON.stringify(before))

// VACUUM INTO：SQLite 原生的热备份方式，生成的是完整且一致的单文件快照
// 注意：目标文件必须不存在，所以先确保不存在同名文件
if (fs.existsSync(target)) fs.unlinkSync(target)
db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`)

// 校验：用独立连接打开备份，比对行数
const check = new sqlite.Database(target)
const verify = {}
for (const t of Object.keys(before)) verify[t] = check.get(`SELECT COUNT(*) AS n FROM ${t}`).n
check.close()

const ok = Object.keys(before).every((t) => before[t] === verify[t])
console.log('[backup] 备份文件:', target, `(${(fs.statSync(target).size / 1024).toFixed(1)} KB)`)
console.log('[backup] 校验行数:', JSON.stringify(verify), ok ? '✓ 一致' : '✗ 不一致')

// 轮转：只保留最近 KEEP 份
const backups = fs
  .readdirSync(BACKUP_DIR)
  .filter((f) => /^worldline_.*\.db$/.test(f))
  .sort()
const removed = []
while (backups.length > KEEP) {
  const old = backups.shift()
  fs.unlinkSync(path.join(BACKUP_DIR, old))
  removed.push(old)
}
console.log(`[backup] 保留 ${backups.length} 份${removed.length ? '，清理 ' + removed.length + ' 份最旧备份' : ''}`)

closeDb()
process.exit(ok ? 0 : 1)
