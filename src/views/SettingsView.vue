<template>
  <div>
    <h1 class="page-title">{{ t('settings') }}</h1>

    <div class="card">
      <div class="set-row">
        <div class="set-label">{{ t('darkMode') }}</div>
        <FluentToggleSwitch :model-value="settings.dark" @update:model-value="(v) => updateSettings({ dark: v })" />
      </div>

      <div class="set-row">
        <div class="set-label">{{ t('language') }}</div>
        <FluentSegmented :model-value="settings.lang" :items="langItems" @update:model-value="(v) => updateSettings({ lang: v })" />
      </div>

      <div class="set-row">
        <div>
          <div class="set-label">{{ t('defaultIndexDir') }}</div>
          <div class="set-hint">{{ t('changeDirHint') }}</div>
          <div class="mono set-path">{{ settings.default_index_dir || '—' }}</div>
        </div>
        <FluentButton @click="changeIndexDir"><Icon icon="fluent:folder-open-24-regular" :width="16" /> {{ t('changeDir') }}</FluentButton>
      </div>
    </div>

    <div class="card">
      <div class="set-row">
        <div class="set-label">{{ t('checkUpdate') }} <span class="set-hint">v{{ version }}</span></div>
        <FluentButton @click="doCheck" :disabled="updateState.checking">
          <Icon icon="fluent:arrow-circle-down-24-regular" :width="16" />
          {{ updateState.checking ? t('checking') : t('checkUpdate') }}
        </FluentButton>
      </div>
      <div v-if="updateState.available" class="update-box">
        <b>{{ t('updateFound') }}: v{{ updateState.version }}</b>
        <FluentHyperlinkButton :href="updateState.url" target="_blank" :label="t('download')" />
      </div>
      <div v-else-if="checked && !updateState.error" class="set-hint">{{ t('upToDate') }}</div>
      <div v-else-if="updateState.error" class="set-hint">{{ t('updateFail') }}: {{ updateState.error }}</div>
    </div>

    <div class="card">
      <div class="set-row">
        <div>
          <div class="set-label">{{ t('openBackend') }}</div>
          <div class="set-hint mono">{{ dataDir }}</div>
        </div>
        <FluentButton @click="openDataDir"><Icon icon="fluent:folder-open-24-regular" :width="16" /></FluentButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { FluentButton, FluentHyperlinkButton, FluentSegmented, FluentToggleSwitch } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { settings, updateSettings } from '../stores/settings'
import { api, pickDir, tauri } from '../utils/api'
import { checkUpdate, updateState, currentVersion } from '../utils/updater'
import { pushToast } from '../components/ToastHost.vue'

const version = currentVersion()
const langItems = [
  { label: t('langZh'), value: 'zh' },
  { label: t('langEn'), value: 'en' }
]
const dataDir = ref('')
const checked = ref(false)

async function changeIndexDir() {
  const d = await pickDir()
  if (!d) return
  try {
    const s = await api.put('/api/settings', { default_index_dir: d })
    settings.default_index_dir = s.default_index_dir
    pushToast({ title: t('changeDir'), body: d })
  } catch (e) {
    pushToast({ title: t('changeDir') + '?', body: e.message })
  }
}

async function doCheck() {
  const r = await checkUpdate()
  checked.value = true
  if (r.available) {
    pushToast({ title: `${t('updateFound')} v${r.version}`, body: r.url })
  } else if (r.error) {
    pushToast({ title: t('updateFail'), body: r.error })
  } else {
    pushToast({ title: t('upToDate'), body: `v${r.version}` })
  }
}

function openDataDir() {
  if (tauri.isTauri && dataDir.value) {
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(dataDir.value))
  }
}

onMounted(async () => {
  try {
    const s = await api.get('/api/settings')
    if (s.default_index_dir) dataDir.value = s.default_index_dir
  } catch { /* ignore */ }
})
</script>

<style scoped>
.card {
  margin-top: 14px;
  padding: 6px 18px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-card-solid, #fff);
}
.set-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
}
.set-row:last-child { border-bottom: none; }
.set-label { font-size: 14px; font-weight: 600; display: flex; align-items: baseline; gap: 8px; }
.set-hint { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
.set-path { font-size: 12px; color: var(--text-secondary); margin-top: 4px; word-break: break-all; }
.update-box { padding: 12px 0; display: flex; align-items: center; gap: 14px; }
</style>
