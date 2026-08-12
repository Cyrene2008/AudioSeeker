<template>
  <FluentTitleBar
    class="titlebar"
    show-window-controls
    @minimize="minimize"
    @maximize="maximize"
    @close="close"
  >
    <div class="titlebar-inner">
      <img :src="avatar" class="tb-avatar" alt="" draggable="false" />
      <span class="tb-title">{{ t('appName') }}</span>
      <div class="tb-spacer" />
      <button class="tb-btn" title="GitHub" @click.stop="openGithub">
        <Icon icon="mdi:github" :width="18" />
      </button>
      <div class="tb-sep" />
    </div>
  </FluentTitleBar>
</template>

<script setup>
import { FluentTitleBar } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import avatar from '../../assets/avatars/Cyrene2008.png'
import { t } from '../../utils/i18n'
import { tauri } from '../../utils/api'

defineProps({})
defineEmits([])

const GITHUB = 'https://github.com/Cyrene2008/CyreneAudioSeeker'

async function minimize() {
  if (tauri.isTauri) {
    const win = (await import('@tauri-apps/api/window')).getCurrentWindow()
    win.minimize()
  }
}
async function maximize() {
  if (tauri.isTauri) {
    const win = (await import('@tauri-apps/api/window')).getCurrentWindow()
    await win.toggleMaximize()
  }
}
async function close() {
  if (tauri.isTauri) {
    const win = (await import('@tauri-apps/api/window')).getCurrentWindow()
    win.close()
  }
}
function openGithub() {
  if (tauri.isTauri) {
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(GITHUB))
  } else {
    window.open(GITHUB)
  }
}
</script>

<style scoped>
.titlebar {
  flex-shrink: 0;
  width: 100%;
}
.titlebar-inner {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  gap: 2px;
}
.titlebar :deep(.title-bar-content) {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  height: 32px;
  align-items: center;
  padding: 0 8px;
}
.titlebar :deep(.title-bar-controls) {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}
.tb-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
}
.tb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #666);
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: background 0.15s;
}
.tb-btn:hover { background: var(--bg-hover, rgba(0, 0, 0, 0.06)); }
.tb-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1f1f1f);
  margin-left: 6px;
  user-select: none;
}
.tb-spacer { flex: 1; }
.tb-sep { width: 1px; height: 18px; margin: 0 6px; background: var(--border-subtle, #e0e0e0); }
</style>
