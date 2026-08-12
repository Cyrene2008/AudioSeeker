<template>
  <div class="download-page">
    <div class="source-bar">
      <span class="source-label">下载源</span>
      <label v-for="s in sources" :key="s.value" class="source-option">
        <input type="radio" :value="s.value" v-model="source" />
        <span>{{ s.label }}</span>
      </label>
      <button class="refresh-btn" :disabled="loading" @click="load(true)">
        {{ loading ? '获取中…' : '刷新' }}
      </button>
    </div>

    <p v-if="error" class="download-error">
      {{ error }}
      <button class="retry-btn" @click="load(true)">重试</button>
    </p>

    <template v-if="!loading && releases.length">
      <div v-for="(r, i) in releases" :key="r.id" class="release-card">
        <div class="release-head">
          <h3>
            {{ r.tag_name }}
            <span v-if="i === 0" class="latest-badge">最新</span>
          </h3>
          <span class="release-date">{{ fmtDate(r.published_at) }}</span>
        </div>
        <p v-if="r.body" class="release-body">{{ r.body }}</p>
        <ul class="asset-list">
          <li v-for="a in installerAssets(r)" :key="a.id" class="asset-row">
            <div class="asset-info">
              <div class="asset-name">{{ a.name }}</div>
              <div class="asset-meta">{{ fmtSize(a.size) }} · 更新于 {{ fmtDate(a.updated_at) }}</div>
            </div>
            <a class="asset-btn" :href="assetUrl(a)" target="_blank" rel="noopener noreferrer">
              下载
            </a>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const REPO = 'Cyrene2008/AudioSeeker'
const API_BASES = [
  `https://gh-proxy.com/https://api.github.com/repos/${REPO}/releases`,
  `https://api.github.com/repos/${REPO}/releases`
]

const sources = [
  { value: 'gh-proxy', label: 'gh-proxy.com 镜像' },
  { value: 'github', label: 'GitHub 官方' }
]
const source = ref('gh-proxy')
const releases = ref([])
const loading = ref(false)
const error = ref('')

const assetUrl = (asset) => {
  const official = asset.browser_download_url
  return source.value === 'gh-proxy' ? `https://gh-proxy.com/${official}` : official
}

const installerAssets = (release) =>
  (release.assets || []).filter((a) => /AudioSeeker_.*_x64-setup\.exe$/i.test(a.name))

function fmtSize(bytes) {
  if (!bytes) return '-'
  if (bytes >= 1 << 30) return `${(bytes / (1 << 30)).toFixed(2)} GB`
  if (bytes >= 1 << 20) return `${(bytes / (1 << 20)).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function fmtDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleString()
}

async function load(force = false) {
  if (loading.value) return
  if (!force && releases.value.length) return
  loading.value = true
  error.value = ''
  try {
    let data = null
    let lastErr = ''
    for (const base of API_BASES) {
      try {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 15000)
        const resp = await fetch(base, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: ctrl.signal
        })
        clearTimeout(timer)
        if (!resp.ok) {
          lastErr = `HTTP ${resp.status}`
          continue
        }
        data = await resp.json()
        break
      } catch (e) {
        lastErr = e.message
      }
    }
    if (!data) throw new Error(lastErr || '获取发布信息失败')
    releases.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>

<style scoped>
.download-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.source-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.source-label {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.source-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.source-option input {
  accent-color: var(--vp-c-brand-1);
}

.refresh-btn {
  margin-left: auto;
  padding: 6px 14px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover {
  background: var(--vp-c-brand-soft);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.download-error {
  padding: 12px 16px;
  border: 1px solid #f1aeb5;
  border-radius: 8px;
  background: rgba(241, 174, 181, 0.12);
  color: #d13438;
}

.retry-btn {
  margin-left: 8px;
  padding: 2px 10px;
  border: 1px solid #d13438;
  border-radius: 4px;
  background: transparent;
  color: #d13438;
  cursor: pointer;
}

.release-card {
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.release-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.release-head h3 {
  margin: 0;
  font-size: 18px;
  color: var(--vp-c-text-1);
}

.latest-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.release-date {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.release-body {
  margin: 8px 0 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  white-space: pre-wrap;
}

.asset-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.asset-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-family: Consolas, Monaco, monospace;
  word-break: break-all;
}

.asset-meta {
  margin-top: 2px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.asset-btn {
  flex-shrink: 0;
  padding: 6px 20px;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff !important;
  text-decoration: none;
  font-weight: 600;
}

.asset-btn:hover {
  background: var(--vp-c-brand-2);
  color: #fff !important;
}
</style>
