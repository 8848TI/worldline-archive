// 内容存档：导出 JSON → 提交 → 推送（给定时任务用，跑完不用管）
//
// 运行：
//   npm run archive              导出 + 提交 + 推送
//   npm run archive -- --no-push 只导出 + 本地提交，不推送（用于本地验证）
//
// 它只 stage server/data/*.json 这四个存档文件，不会把你正在改的其他代码一起提交。
// 远程/分支可用 ARCHIVE_REMOTE / ARCHIVE_BRANCH 覆盖（默认 origin + 当前分支），
// 以后想把内容推到私有仓库，改这两个变量即可。
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readEnv } from '../utils/envFile.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = path.join(__dirname, '..')
const env = readEnv()

const ARCHIVE_FILES = [
  'server/data/content.json',
  'server/data/music.json',
  'server/data/tag-categories.json',
  'server/data/settings.json'
]

const noPush = process.argv.includes('--no-push')
const log = (...a) => console.log('[archive]', ...a)

// 先定位仓库根目录，之后的 git 命令都在根目录执行（存档文件路径是相对仓库根的）
let gitCwd = SERVER_DIR
function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: gitCwd, encoding: 'utf-8', stdio: opts.stdio || ['ignore', 'pipe', 'pipe'] }).trim()
}

let repoRoot
try {
  repoRoot = git(['rev-parse', '--show-toplevel'])
  gitCwd = repoRoot
} catch {
  console.error('[archive] 当前目录不在 git 仓库里，无法存档')
  process.exit(1)
}

// 1) 导出最新内容到 JSON（复用 db:export 的逻辑）
log('导出内容 →', ARCHIVE_FILES.length, '个存档文件')
await import('./export-db-to-json.js')

// 2) 只 stage 这四个文件
for (const f of ARCHIVE_FILES) git(['add', '--', f])

// 3) 有变化才提交
const changed = (() => {
  try {
    git(['diff', '--cached', '--quiet', '--', ...ARCHIVE_FILES])
    return false // 退出码 0 = 无差异
  } catch {
    return true
  }
})()

if (!changed) {
  log('内容无变化，跳过提交')
  process.exit(0)
}

const stamp = new Date().toLocaleString('zh-CN', { hour12: false })
git(['commit', '-m', `chore: 同步内容存档（${stamp}）`])
log('已提交:', git(['log', '-1', '--oneline']))

if (noPush) {
  log('--no-push：已跳过推送（本地提交仍在，可用 git reset --soft HEAD~1 撤销）')
  process.exit(0)
}

// 4) 推送：先直推，被拒再 rebase 后重试
const remote = env.ARCHIVE_REMOTE || 'origin'
const branch = env.ARCHIVE_BRANCH || git(['rev-parse', '--abbrev-ref', 'HEAD'])

try {
  git(['push', remote, branch], { stdio: ['ignore', 'pipe', 'inherit'] })
  log(`已推送到 ${remote}/${branch}`)
} catch {
  log(`直推失败，尝试同步远端（git pull --rebase ${remote} ${branch}）`)
  try {
    git(['pull', '--rebase', remote, branch], { stdio: ['ignore', 'pipe', 'inherit'] })
    git(['push', remote, branch], { stdio: ['ignore', 'pipe', 'inherit'] })
    log(`已推送到 ${remote}/${branch}`)
  } catch (err) {
    console.error('[archive] 推送失败，请手动检查：')
    console.error('  · git 凭据是否有效（推送需要账号/token）')
    console.error('  · 是否有冲突需要手动解决')
    console.error('  详细错误：', String(err.message).split('\n')[0])
    process.exit(1)
  }
}
