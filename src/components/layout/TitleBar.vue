<template>
  <FluentTitleBar class="titlebar" :draggable="false">
    <div class="titlebar-drag" aria-hidden="true" />
    <div class="titlebar-inner">
      <img :src="avatar" class="tb-avatar" alt="" draggable="false" />
      <button class="tb-btn hamburger" :class="{ active: hamburger }" title="菜单" @click.stop="$emit('toggle-hamburger')">
        <Icon icon="fluent:line-horizontal-3-20-regular" :width="18" />
      </button>
      <span class="tb-title">{{ t('appName') }}</span>
      <div class="tb-spacer" />
      <button class="tb-btn" title="GitHub" @click.stop="openGithub">
        <Icon icon="mdi:github" :width="18" />
      </button>
      <div class="tb-sep" />
      <button class="tb-btn win" title="最小化" @click.stop="minimize">
        <Icon icon="fluent:subtract-24-regular" :width="16" />
      </button>
      <button class="tb-btn win" title="最大化" @click.stop="maximize">
        <Icon icon="fluent:square-24-regular" :width="12" />
      </button>
      <button class="tb-btn win close" title="关闭" @click.stop="close">
        <Icon icon="fluent:dismiss-24-regular" :width="16" />
      </button>
    </div>
  </FluentTitleBar>
</template>

<script setup>
import { FluentTitleBar } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import avatar from '../../assets/avatars/Cyrene2008.png'
import { t } from '../../utils/i18n'
import { tauri } from '../../utils/api'

defineProps({ hamburger: Boolean })
defineEmits(['toggle-hamburger'])

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
  position: relative;
  border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
}
/* 自定义拖拽条：铺满标题栏空白区域；按钮需在其上方并 no-drag */
.titlebar-drag {
  position: absolute;
  inset: 0;
  -webkit-app-region: drag;
  z-index: 0;
}
.titlebar-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 4px;
  gap: 2px;
}
.tb-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 8px;
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
.tb-btn.hamburger.active { background: var(--bg-hover, rgba(0, 0, 0, 0.08)); color: var(--accent); }
.tb-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1f1f1f);
  margin-left: 6px;
  user-select: none;
}
.tb-spacer { flex: 1; }
.tb-sep { width: 1px; height: 18px; margin: 0 6px; background: var(--border-subtle, #e0e0e0); }
.tb-btn.win { border-radius: 0; height: 32px; width: 42px; }
.tb-btn.win.close:hover { background: #e81123; color: #fff; }
</style>
