<template>
  <div class="app-shell">
    <TitleBar />
    <div class="app-body">
      <Dock />
      <div class="page-view">
        <div class="app-content">
          <router-view v-slot="{ Component }">
            <transition name="page-forward" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
        <PlayerBar />
        <FluentInfoBar
          v-if="!backendState.ready"
          severity="warning"
          title="正在连接本地引擎…"
          :closable="false"
          class="backend-warning"
        />
      </div>
    </div>

    <VersionBadge v-if="!player.active" />
    <ToastHost />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { FluentInfoBar } from 'vue-fluent-widgets'
import TitleBar from './components/layout/TitleBar.vue'
import Dock from './components/layout/Dock.vue'
import PlayerBar from './components/layout/PlayerBar.vue'
import ToastHost from './components/ToastHost.vue'
import VersionBadge from './components/VersionBadge.vue'
import { api, tauri } from './utils/api'
import { loadSettingsFromBackend } from './stores/settings'
import { backendState, startBackendPoll } from './stores/backend'
import { player } from './stores/player'

onMounted(async () => {
  if (tauri.isTauri) startBackendPoll()
  try {
    loadSettingsFromBackend(await api.get('/api/settings'))
  } catch { /* 引擎毫秒级就绪，首帧偶发未成功属正常 */ }
})
</script>

<style scoped>
.backend-warning { margin: 0 16px 10px; }
</style>
