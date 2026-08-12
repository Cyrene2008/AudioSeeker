<template>
  <div class="app-shell">
    <template v-if="bootState.phase !== 'ready' && !skipped">
      <div class="boot-overlay">
        <div class="boot-card">
          <img :src="bootAvatar" class="boot-logo" alt="" draggable="false" />
          <h2>{{ t('appName') }}</h2>
          <p class="boot-detail">{{ bootDetail }}</p>
          <div class="boot-bar">
            <div class="boot-bar-inner" :style="{ width: bootProgress + '%' }" />
          </div>
          <p v-if="bootState.phase === 'error'" class="boot-error">{{ bootState.error }}</p>
          <div v-if="bootState.phase === 'error'" class="boot-skip">
            <FluentButton @click="location.reload()">{{ t('refresh') }}</FluentButton>
          </div>
          <div v-if="bootLong" class="boot-skip">
            <FluentButton appearance="subtle" @click="skipBoot">
              跳过等待，直接进入界面（后端将在后台继续启动）
            </FluentButton>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <TitleBar />
      <div class="app-body">
        <Dock />
        <div class="app-content">
          <router-view v-slot="{ Component }">
            <transition name="page-forward" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
      <PlayerBar />
      <FluentInfoBar
        v-if="bootState.phase !== 'ready'"
        severity="warning"
        :title="bootDetail"
        :closable="false"
        style="margin: 0 16px"
      />
    </template>

    <VersionBadge />
    <ToastHost />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { FluentButton, FluentInfoBar } from 'vue-fluent-widgets'
import bootAvatar from './assets/avatars/Cyrene2008.png'
import TitleBar from './components/layout/TitleBar.vue'
import Dock from './components/layout/Dock.vue'
import PlayerBar from './components/layout/PlayerBar.vue'
import ToastHost from './components/ToastHost.vue'
import VersionBadge from './components/VersionBadge.vue'
import { t } from './utils/i18n'
import { tauri, api } from './utils/api'
import { loadSettingsFromBackend } from './stores/settings'

const bootState = ref({ phase: 'starting', detail: '', progress: 0, error: '' })
const bootLong = ref(false)
const skipped = ref(false)

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
let longTimer = null

async function poll() {
  let s = null
  try {
    s = await tauri.invoke('backend_status')
  } catch { /* invoke 异常时继续轮询 */ }
  if (s) bootState.value = s
  if (s && s.ready) {
    clearInterval(timer)
    clearTimeout(longTimer)
    try {
      loadSettingsFromBackend(await api.get('/api/settings'))
    } catch { /* ignore */ }
    return
  }
  timer = setTimeout(poll, 800)
}

function skipBoot() {
  skipped.value = true // 直接进入主界面，后端后台继续启动，就绪后自动刷新
  poll()
}

onMounted(() => {
  if (!tauri.isTauri) {
    bootState.value = { phase: 'ready', detail: '', progress: 1 }
    loadSettingsFromBackend({ lang: 'zh', dark: false })
    return
  }
  poll()
  longTimer = setTimeout(() => { bootLong.value = true }, 15000)
})

onUnmounted(() => {
  clearInterval(timer)
  clearTimeout(longTimer)
})
</script>

<style scoped>
.boot-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #ffd9ec 0%, #fdf5fa 45%, #ffcfe8 100%);
  z-index: 999;
}
.dark .boot-overlay {
  background: linear-gradient(160deg, #2d1a25 0%, #3a2232 55%, #24131e 100%);
}
.boot-card {
  width: 360px;
  max-width: calc(100vw - 32px);
  text-align: center;
  padding: 36px 28px;
  border-radius: 18px;
  background: var(--bg-card-solid, #fff8fc);
  border: 1px solid var(--border-strong, rgba(234, 94, 193, 0.25));
  box-shadow: 0 12px 40px rgba(234, 94, 193, 0.18);
  overflow: hidden;
}
.boot-skip {
  margin-top: 12px;
}
.boot-skip :deep(button) {
  width: 100%;
}
.boot-logo {
  width: 88px;
  height: 88px;
  margin: 0 auto 14px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(234, 94, 193, 0.3);
}
.boot-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
  color: var(--text-primary, #3d1a2e);
}
.boot-detail {
  margin: 0 0 14px;
  color: var(--text-secondary, #6b3a55);
  font-size: 13px;
  min-height: 18px;
}
.boot-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--bg-hover, rgba(234, 94, 193, 0.15));
  overflow: hidden;
  margin-bottom: 10px;
}
.boot-bar-inner {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #ff6fb0, #ea5ec1);
  transition: width 0.3s;
}
.boot-error {
  color: #d13438;
  font-size: 12px;
  word-break: break-all;
}
</style>
