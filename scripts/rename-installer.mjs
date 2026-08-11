// 构建后把 NSIS 安装包重命名为 CyreneAudioSeeker_<版本>_x64-setup.exe
// 版本号从 src-tauri/tauri.conf.json 读取（与 Cargo.toml 保持一致）
import { readFileSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const nsisDir = join(root, 'src-tauri', 'target', 'release', 'bundle', 'nsis')
const conf = JSON.parse(readFileSync(join(root, 'src-tauri', 'tauri.conf.json'), 'utf-8'))
const version = conf.version

const targetName = `CyreneAudioSeeker_${version}_x64-setup.exe`
const target = join(nsisDir, targetName)
rmSync(target, { force: true })

// 找刚构建的安装包（含版本号的原名），改名
for (const f of readdirSync(nsisDir)) {
  if (!f.endsWith('.exe') || f === targetName) continue
  const full = join(nsisDir, f)
  if (f.includes(version)) {
    renameSync(full, target)
    console.log(`[rename-installer] ${f} -> ${targetName}`)
  } else {
    rmSync(full, { force: true })
    console.log(`[rename-installer] 清理残留: ${f}`)
  }
}
if (!readdirSync(nsisDir).includes(targetName)) {
  console.error('[rename-installer] 未找到待重命名的安装包')
  process.exit(1)
}
