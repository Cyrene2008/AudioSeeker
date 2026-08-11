// 同步后端文件到 Tauri 资源目录（打包时随程序分发）
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', 'backend')
const dst = join(here, '..', 'src-tauri', 'resources', 'backend')
mkdirSync(dst, { recursive: true })

const FILES = ['fp_core.py', 'build_index.py', 'match.py', 'server.py', 'requirements.txt']
for (const f of FILES) {
  copyFileSync(join(src, f), join(dst, f))
}
console.log(`[sync:backend] 已同步 ${FILES.length} 个文件到 ${dst}`)
