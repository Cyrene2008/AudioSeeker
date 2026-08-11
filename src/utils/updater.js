// 更新检查：GitHub API（固定仓库 github.com/Cyrene2008/CyreneAudioSeeker）
import { ref } from 'vue'
import { tauri } from './api'

const GITHUB_REPO = 'Cyrene2008/CyreneAudioSeeker'
const FALLBACK_URLS = [
  `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
  `https://api.kkgithub.com/repos/${GITHUB_REPO}/releases/latest`,
  `https://gh-proxy.com/https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
]

export const updateState = ref({
  checking: false,
  available: false,
  version: '',
  url: '',
  body: '',
  error: null
})

export function currentVersion() {
  return tauri.isTauri
    ? '0.1.0'
    : (import.meta.env.VITE_APP_VERSION || '0.1.0')
}

function normalize(v) {
  return String(v || '').replace(/^v/i, '').trim()
}

export function compareVersions(a, b) {
  const pa = normalize(a).split('.').map(Number)
  const pb = normalize(b).split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0
    const y = pb[i] || 0
    if (x > y) return 1
    if (x < y) return -1
  }
  return 0
}

export async function checkUpdate() {
  updateState.value.checking = true
  updateState.value.error = null
  for (const url of FALLBACK_URLS) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 10000)
      const resp = await fetch(url, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: ctrl.signal
      })
      clearTimeout(timer)
      if (!resp.ok) continue
      const data = await resp.json()
      const latest = normalize(data.tag_name)
      updateState.value.available = compareVersions(latest, currentVersion()) > 0
      updateState.value.version = latest
      updateState.value.body = data.body || ''
      updateState.value.url = data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`
      updateState.value.checking = false
      return updateState.value
    } catch { /* 尝试下一个源 */ }
  }
  updateState.value.checking = false
  updateState.value.error = 'check failed'
  return updateState.value
}
