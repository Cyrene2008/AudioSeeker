<template>
  <div class="about">
    <div class="about-card">
      <div class="about-logo">🔊</div>
      <h1>Cyreneの音频检索器</h1>
      <div class="about-ver mono">v{{ version }}</div>
      <p class="about-desc">{{ t('ackLibs') }}</p>

      <div class="about-actions">
        <FluentButton @click="openRepo"><Icon icon="fluent:mark-github-24-regular" :width="16" /> {{ t('openRepo') }}</FluentButton>
        <FluentButton @click="doCheck" :disabled="updateState.checking">
          <Icon icon="fluent:arrow-circle-down-24-regular" :width="16" />
          {{ updateState.checking ? t('checking') : t('checkUpdate') }}
        </FluentButton>
      </div>

      <div v-if="updateState.available" class="update-box">
        <b>{{ t('updateFound') }}: v{{ updateState.version }}</b>
        <FluentHyperlinkButton :href="updateState.url" target="_blank" :label="t('download')" />
      </div>

      <div class="about-links">
        <FluentHyperlinkButton href="https://github.com/Cyrene2008/CyreneAudioSeeker" target="_blank" label="GitHub" />
        <span class="about-copy">© {{ new Date().getFullYear() }} Cyrene2008</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FluentButton, FluentHyperlinkButton } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../utils/i18n'
import { tauri } from '../utils/api'
import { checkUpdate, updateState, currentVersion } from '../utils/updater'
import { pushToast } from '../components/ToastHost.vue'

const version = currentVersion()
const GITHUB = 'https://github.com/Cyrene2008/CyreneAudioSeeker'

function openRepo() {
  if (tauri.isTauri) {
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(GITHUB))
  } else {
    window.open(GITHUB)
  }
}

async function doCheck() {
  const r = await checkUpdate()
  if (r.available) {
    pushToast({ title: `${t('updateFound')} v${r.version}`, body: r.url })
  } else if (r.error) {
    pushToast({ title: t('updateFail'), body: r.error })
  } else {
    pushToast({ title: t('upToDate'), body: `v${r.version}` })
  }
}
</script>

<style scoped>
.about { display: flex; justify-content: center; padding-top: 8vh; }
.about-card {
  width: 420px;
  text-align: center;
  padding: 40px 32px;
  border-radius: 16px;
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-card-solid, #fff);
}
.about-logo { font-size: 52px; }
.about-card h1 { margin: 12px 0 4px; font-size: 22px; }
.about-ver { color: var(--text-secondary); font-size: 13px; }
.about-desc { margin: 18px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.about-actions { display: flex; justify-content: center; gap: 10px; }
.update-box { margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 13px; }
.about-links {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 12px;
}
.about-copy { color: var(--text-muted, #999); }
</style>
