<template>
  <FluentTitleBar
    class="titlebar"
    draggable
    :show-window-controls="false"
    @minimize="minimize"
    @maximize="maximize"
    @close="close"
  >
    <div class="titlebar-inner">
      <button class="tb-btn hamburger" :class="{ active: hamburger }" title="菜单" @click.stop="$emit('toggle-hamburger')">
        <Icon icon="fluent:line-horizontal-3-20-regular" :width="18" />
      </button>
      <span class="tb-title">{{ t('appName') }}</span>
      <div class="tb-spacer" />
      <button class="tb-btn" :title="t('checkUpdate')" @click.stop="doCheck">
        <Icon icon="fluent:arrow-circle-down-24-regular" :width="17" />
      </button>
      <button class="tb-btn" title="GitHub" @click.stop="openGithub">
        <Icon icon="fluent:mark-github-24-regular" :width="17" />
      </button>
      <button class="tb-btn" :title="t('settings')" @click.stop="router.push('/settings')">
        <Icon icon="fluent:settings-24-regular" :width="17" />
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
import { useRouter } from 'vue-router'
import { t } from '../../utils/i18n'
import { tauri } from '../../utils/api'
import { checkUpdate, updateState } from '../../utils/updater'
import { pushToast } from '../../components/ToastHost.vue'

defineProps({ hamburger: Boolean })
defineEmits(['toggle-hamburger'])

const router = useRouter()
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
async function doCheck() {
  const r = await checkUpdate()
  if (r.available) {
    pushToast({ title: `${t('updateFound')} v${r.version}`, body: (r.body || '').slice(0, 200), url: r.url })
  } else if (r.error) {
    pushToast({ title: t('updateFail'), body: r.error })
  } else {
    pushToast({ title: t('upToDate'), body: `v${r.version}` })
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
  border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
}
.titlebar-inner {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 4px;
  gap: 2px;
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
