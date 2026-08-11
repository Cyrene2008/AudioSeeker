<template>
  <div class="app-shell">
    <template v-if="bootState.phase !== 'ready'">
      <div class="boot-overlay">
        <div class="boot-card">
          <div class="boot-logo">🔊</div>
          <h2>{{ t('appName') }}</h2>
          <p class="boot-detail">{{ bootDetail }}</p>
          <div class="boot-bar">
            <div class="boot-bar-inner" :style="{ width: bootProgress + '%' }" />
          </div>
          <p v-if="bootState.phase === 'error'" class="boot-error">{{ bootState.error }}</p>
          <FluentButton v-if="bootState.phase === 'error'" @click="location.reload()">
            {{ t('refresh') }}
          </FluentButton>
        </div>
      </div>
    </template>

    <template v-else>
      <TitleBar :hamburger="hamburgerOpen" @toggle-hamburger="hamburgerOpen = !hamburgerOpen" />
      <div class="app-body">
        <Dock :hamburger-open="hamburgerOpen" />
        <main class="app-content">
          <router-view />
        </main>
      </div>
      <PlayerBar />
    </template>

    <ToastHost />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { FluentButton } from 'vue-fluent-widgets'
import TitleBar from './components/layout/TitleBar.vue'
import Dock from './components/layout/Dock.vue'
import PlayerBar from './components/layout/PlayerBar.vue'
import ToastHost from './components/ToastHost.vue'
import { t } from './utils/i18n'
import { tauri, api } from './utils/api'
import { loadSettingsFromBackend } from './stores/settings'

const bootState = ref({ phase: 'starting', detail: '', progress: 0, error: '' })
const hamburgerOpen = ref(false)

const bootDetail = computed(() => {
  const s = bootState.value
  const map = {
    starting: t('boot'),
    downloadingpython: '正在下载 Python 运行时',
    extractingpython: '正在解压 Python 运行时…',
    installingpip: '正在安装 pip…',
    installingdeps: '正在安装 Python 依赖…',
    checkingffmpeg: '正在检查 ffmpeg…',
    downloadingffmpeg: '正在下载 ffmpeg',
    extractingffmpeg: '正在解压 ffmpeg…',
    startingbackend: '正在启动后端服务…',
    ready: t('bootReady'),
    error: s.error || t('bootError')
  }
  const base = map[s.phase] || s.detail
  if (s.progress > 0 && s.detail && s.phase !== 'ready') {
    return `${base} · ${s.detail}`
  }
  return base
})
const bootProgress = computed(() => {
  const s = bootState.value
  if (s.phase === 'ready') return 100
  return Math.round(Math.min(95, s.progress * 100))
})

let timer = null

async function poll() {
  const s = await tauri.invoke('backend_status')
  if (s) bootState.value = s
  if (s && s.ready) {
    clearInterval(timer)
    try {
      loadSettingsFromBackend(await api.get('/api/settings'))
    } catch { /* ignore */ }
    return
  }
  timer = setTimeout(poll, 800)
}

onMounted(() => {
  if (!tauri.isTauri) {
    bootState.value = { phase: 'ready', detail: '', progress: 1 }
    loadSettingsFromBackend({ lang: 'zh', dark: true })
    return
  }
  poll()
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.boot-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base, #fdf5fa);
  z-index: 999;
}
.boot-card {
  width: 340px;
  text-align: center;
}
.boot-logo {
  font-size: 44px;
  margin-bottom: 8px;
}
.boot-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
}
.boot-detail {
  margin: 0 0 14px;
  color: var(--text-secondary, #666);
  font-size: 13px;
  min-height: 18px;
}
.boot-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.08));
  overflow: hidden;
  margin-bottom: 10px;
}
.boot-bar-inner {
  height: 100%;
  border-radius: 3px;
  background: var(--accent, #ff69a0);
  transition: width 0.3s;
}
.boot-error {
  color: #d13438;
  font-size: 12px;
  word-break: break-all;
}
</style>
