// 更新检查：GitHub API（固定仓库 github.com/Cyrene2008/AudioSeeker）
import { ref } from 'vue'
import { tauri } from './api'

const GITHUB_REPO = 'Cyrene2008/AudioSeeker'
const FALLBACK_URLS = [
  `https://gh-proxy.com/https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
  `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
]
const OFFICIAL_RELEASE_URL = `https://github.com/${GITHUB_REPO}/releases/latest`

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
    ? '26.1.0'
    : (import.meta.env.VITE_APP_VERSION || '26.1.0')
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

function releaseDownloadUrl(data) {
  const assets = Array.isArray(data.assets) ? data.assets : []
  const installer = assets.find((asset) => /AudioSeeker_.*_x64-setup\.exe$/i.test(asset.name))
    || assets.find((asset) => /x64.*setup\.exe$/i.test(asset.name))
  if (!installer?.browser_download_url) return data.html_url || OFFICIAL_RELEASE_URL
  return `https://gh-proxy.com/${installer.browser_download_url}`
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
      updateState.value.url = releaseDownloadUrl(data)
      updateState.value.checking = false
      return updateState.value
    } catch { /* 尝试下一个源 */ }
  }
  updateState.value.checking = false
  updateState.value.error = 'check failed'
  return updateState.value
}
