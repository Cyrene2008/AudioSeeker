// Tauri 环境与后端 API 封装（双通道）
// - Tauri：走原生 command invoke（无 HTTP、无端口）
// - 浏览器 dev / 服务化部署：走 casi-server HTTP
const isTauri = typeof window !== 'undefined' && (
  '__TAURI_INTERNALS__' in window || '__TAURI__' in window)

async function invoke(cmd, args) {
  if (!isTauri) return null
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke(cmd, args)
}

let port = 8765
let portReady = null

async function ensurePort() {
  if (isTauri) return
  if (portReady) return portReady
  portReady = (async () => {
    try {
      const p = await invoke('backend_port')
      if (p) port = p
    } catch { /* 浏览器模式用默认端口 */ }
    window.__CYRENE_PORT__ = port
  })()
  await portReady
}

export async function checkHealth() {
  if (isTauri) {
    try {
      const s = await invoke('backend_status')
      return !!(s && s.ready)
    } catch {
      return false
    }
  }
  await ensurePort()
  try {
    const resp = await fetch(`${apiBase()}/api/health`, { signal: AbortSignal.timeout(10000) })
    if (!resp.ok) return false
    const d = await resp.json()
    return d && d.ok === true
  } catch {
    return false
  }
}

export const tauri = { isTauri, invoke }

export const apiBase = () => `http://127.0.0.1:${port}`

// HTTP 路径 → Tauri command 映射
const COMMAND_MAP = [
  { get: '/api/settings', cmd: 'casi_settings_get', args: () => ({}) },
  { put: '/api/settings', cmd: 'casi_settings_put', args: (body) => body },
  { get: '/api/indexes', cmd: 'casi_indexes', args: (_, q) => ({ include_stats: q.get('include_stats') !== 'false' }) },
  { post: '/api/indexes/import', cmd: 'casi_index_import', args: (body) => body },
  { del: '/api/indexes/', cmd: 'casi_index_delete', args: (body, q, path) => ({ name: path.slice('/api/indexes/'.length), delete_files: q.get('delete_files') === 'true' }) },
  { post: '/api/build/start', cmd: 'casi_build_start', args: (body) => body },
  { get: '/api/build/status', cmd: 'casi_build_status', args: () => ({}) },
  { post: '/api/build/cancel', cmd: 'casi_build_cancel', args: () => ({}) },
  { post: '/api/error-log', cmd: 'casi_error_log', args: (body) => body },
  { get: '/api/history', cmd: 'casi_history_list', args: () => ({}) },
  { get: '/api/history/', cmd: 'casi_history_get', args: (body, q, path) => ({ hid: path.slice('/api/history/'.length) }) },
  { del: '/api/history/', cmd: 'casi_history_delete', args: (body, q, path) => ({ hid: path.slice('/api/history/'.length) }) },
  { post: '/api/match', cmd: 'casi_match', args: (body) => body },
  { post: '/api/export', cmd: 'casi_export', args: (body) => body },
  { get: '/api/favorites', cmd: 'casi_favorites_get', args: () => ({}) },
  { post: '/api/favorites', cmd: 'casi_favorites_add', args: (body) => body },
  { del: '/api/favorites/', cmd: 'casi_favorites_delete', args: (body, q, path) => ({ fid: path.slice('/api/favorites/'.length) }) },
]

function mapCommand(method, path, body) {
  const qIdx = path.indexOf('?')
  const query = new URLSearchParams(qIdx >= 0 ? path.slice(qIdx + 1) : '')
  const base = qIdx >= 0 ? path.slice(0, qIdx) : path
  for (const entry of COMMAND_MAP) {
    for (const key of ['get', 'post', 'put', 'del']) {
      if (!(key in entry)) continue
      const prefix = entry[key]
      const exact = !prefix.endsWith('/')
      const matches = exact ? base === prefix : base.startsWith(prefix)
      if (matches && (
        (key === 'get' && method === 'GET') ||
        (key === 'post' && method === 'POST') ||
        (key === 'put' && method === 'PUT') ||
        (key === 'del' && method === 'DELETE')
      )) {
        return { cmd: entry.cmd, args: entry.args(body, query, base) }
      }
    }
  }
  return null
}

async function request(method, path, body) {
  if (isTauri) {
    const m = mapCommand(method, path, body)
    if (m) {
      return invoke(m.cmd, m.args)
    }
    throw new Error(`未映射的命令: ${method} ${path}`)
  }
  await ensurePort()
  const opts = { method, headers: {} }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const resp = await fetch(apiBase() + path, opts)
  if (!resp.ok) {
    let detail = resp.statusText
    try {
      const j = await resp.json()
      detail = j.detail || j.error || detail
    } catch { /* ignore */ }
    throw new Error(detail)
  }
  return resp.json()
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path)
}

// 音频播放来源：Tauri 下走 asset protocol（本地文件直读），否则 HTTP
let convertFileSrcFn = null
if (isTauri) {
  import('@tauri-apps/api/core').then((m) => { convertFileSrcFn = m.convertFileSrc }).catch(() => {})
}
let pendingAudioUrl = null

export function audioUrl(path) {
  if (isTauri) {
    if (convertFileSrcFn) return convertFileSrcFn(path)
    if (!pendingAudioUrl) {
      pendingAudioUrl = import('@tauri-apps/api/core').then((m) => m.convertFileSrc(path))
    }
    return path // 预加载完成前的兜底（主界面通常在模块加载后使用）
  }
  return `${apiBase()}/api/audio?${new URLSearchParams({ path })}`
}

export async function pickFile(filters) {
  if (!isTauri) return null
  const { open } = await import('@tauri-apps/plugin-dialog')
  return open({ multiple: false, filters })
}

export async function pickDir() {
  if (!isTauri) return null
  const { open } = await import('@tauri-apps/plugin-dialog')
  return open({ directory: true })
}

export async function savePath(defaultPath, filters) {
  if (!isTauri) return null
  const { save } = await import('@tauri-apps/plugin-dialog')
  return save({ defaultPath, filters })
}
