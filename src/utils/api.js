// Tauri 环境与后端 API 封装
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
  if (portReady) return portReady
  portReady = (async () => {
    try {
      const p = await invoke('backend_port')
      if (p) port = p
    } catch { /* 浏览器模式或 Tauri 未就绪，用默认端口 */ }
    window.__CYRENE_PORT__ = port
  })()
  await portReady
}

export async function checkHealth() {
  await ensurePort()
  try {
    const resp = await fetch(`${apiBase()}/api/health`, { signal: AbortSignal.timeout(3000) })
    if (!resp.ok) return false
    const d = await resp.json()
    return d && d.ok === true
  } catch {
    return false
  }
}

export const tauri = { isTauri, invoke }

export const apiBase = () => `http://127.0.0.1:${port}`

async function request(method, path, body) {
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

export function audioUrl(path, offset, duration) {
  const p = new URLSearchParams({ path })
  if (offset !== undefined && offset !== null) p.set('offset', String(offset))
  if (duration !== undefined && duration !== null) p.set('duration', String(duration))
  return `${apiBase()}/api/audio?${p.toString()}`
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
