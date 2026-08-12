<template>
  <div class="page page-scroll settings-page">
    <h1 class="page-title">{{ t('settings') }}</h1>

    <div class="settings-list">
      <FluentSettingsCard :title="t('darkMode')" icon="dark-theme-20-regular">
        <template #action>
          <FluentToggleSwitch :model-value="settings.dark" @update:model-value="(v) => updateSettings({ dark: v })" />
        </template>
      </FluentSettingsCard>

      <FluentSettingsCard :title="t('language')" icon="local-language-20-regular">
        <template #action>
          <FluentSelect :model-value="settings.lang" :options="langItems" width="180px" @update:model-value="(v) => updateSettings({ lang: v })" />
        </template>
      </FluentSettingsCard>

      <FluentSettingsCard :title="t('defaultIndexDir')" :description="t('changeDirHint')" icon="folder-20-regular">
        <template #action>
          <FluentButton variant="secondary" @click="changeIndexDir">
            <Icon icon="fluent:folder-open-24-regular" :width="16" /> {{ t('changeDir') }}
          </FluentButton>
        </template>
        <div class="mono set-path">{{ settings.default_index_dir || '—' }}</div>
      </FluentSettingsCard>

      <FluentSettingsCard :title="t('unloadIndexAfterSearch')" :description="t('unloadIndexAfterSearchHint')" icon="database-arrow-down-20-regular">
        <template #action>
          <FluentToggleSwitch :model-value="settings.unload_index_after_search" @update:model-value="(v) => updateSettings({ unload_index_after_search: v })" />
        </template>
      </FluentSettingsCard>

      <FluentSettingsCard :title="`${t('checkUpdate')} · v${version}`" icon="arrow-circle-down-20-regular">
        <template #action>
          <FluentButton variant="secondary" :disabled="updateState.checking" @click="doCheck">
            <Icon icon="fluent:arrow-circle-down-24-regular" :width="16" />
            {{ updateState.checking ? t('checking') : t('checkUpdate') }}
          </FluentButton>
        </template>
        <div v-if="updateState.available" class="update-box">
          <b>{{ t('updateFound') }}: v{{ updateState.version }}</b>
          <FluentHyperlinkButton :href="updateState.url" target="_blank" :label="t('download')" />
        </div>
        <div v-else-if="checked && !updateState.error" class="set-hint">{{ t('upToDate') }}</div>
        <div v-else-if="updateState.error" class="set-hint">{{ t('updateFail') }}: {{ updateState.error }}</div>
      </FluentSettingsCard>

      <FluentSettingsCard :title="t('openBackend')" icon="folder-open-20-regular">
        <template #action>
          <FluentButton variant="subtle" icon-only :title="t('openBackend')" @click="openDataDir">
            <Icon icon="fluent:folder-open-24-regular" :width="16" />
          </FluentButton>
        </template>
        <div class="set-hint mono">{{ dataDir || '—' }}</div>
      </FluentSettingsCard>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  FluentButton, FluentHyperlinkButton, FluentSelect, FluentSettingsCard, FluentToggleSwitch
} from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { settings, updateSettings } from '../stores/settings'
import { api, pickDir, tauri } from '../utils/api'
import { checkUpdate, updateState, currentVersion } from '../utils/updater'
import { pushToast } from '../components/ToastHost.vue'

const version = currentVersion()
const langItems = computed(() => [
  { label: t('langZh'), value: 'zh' },
  { label: t('langEn'), value: 'en' }
])
const dataDir = ref('')
const checked = ref(false)

async function changeIndexDir() {
  const directory = await pickDir()
  if (!directory) return
  try {
    const result = await api.put('/api/settings', { default_index_dir: directory })
    settings.default_index_dir = result.default_index_dir
    pushToast({ title: t('changeDir'), body: directory })
  } catch (error) {
    pushToast({ title: t('changeDir') + '?', body: error.message })
  }
}

async function doCheck() {
  const result = await checkUpdate()
  checked.value = true
  if (result.available) pushToast({ title: `${t('updateFound')} v${result.version}`, body: result.url })
  else if (result.error) pushToast({ title: t('updateFail'), body: result.error })
  else pushToast({ title: t('upToDate'), body: `v${result.version}` })
}

function openDataDir() {
  if (tauri.isTauri && dataDir.value) {
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(dataDir.value))
  }
}

onMounted(async () => {
  try {
    const result = await api.get('/api/settings')
    dataDir.value = result.data_dir || ''
  } catch { /* 后端未就绪时静默 */ }
})
</script>

<style scoped>
.settings-list { display: grid; gap: 10px; padding-bottom: 4px; }
.set-hint { font-size: 12px; color: var(--text-secondary); overflow-wrap: anywhere; }
.set-path { min-width: 0; font-size: 12px; color: var(--text-secondary); word-break: break-all; user-select: text; }
.update-box { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.settings-page :deep(.fluent-settings-card) { border-color: var(--border-subtle); }
@media (max-width: 760px) {
  .settings-page :deep(.settings-card-header) { align-items: flex-start; flex-wrap: wrap; }
  .settings-page :deep(.card-action) { width: 100%; margin-left: 52px; }
}
</style>
