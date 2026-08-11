<template>
  <div class="about">
    <div class="about-card">
      <img :src="avatar" class="about-avatar" alt="Cyrene2008" />
      <h1>Cyreneの音频检索器</h1>
      <div class="about-ver mono">v{{ version }}<span v-if="build" class="about-build"> · build {{ build }}</span></div>
      <p class="about-desc">{{ t('ackLibs') }}</p>

      <div class="about-actions">
        <FluentButton @click="openRepo"><Icon icon="mdi:github" :width="16" /> {{ t('openRepo') }}</FluentButton>
      </div>

      <div class="about-powered">
        <span class="powered-text">Powered by</span>
        <FluentHyperlinkButton href="https://www.npmjs.com/package/vue-fluent-widgets" target="_blank" label="VueFluentWidgets" />
      </div>

      <div class="about-links">
        <span class="about-copy">© {{ new Date().getFullYear() }} Cyrene2008</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FluentButton, FluentHyperlinkButton } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import avatar from '../assets/avatars/Cyrene2008.png'
import { t } from '../utils/i18n'
import { tauri } from '../utils/api'
import { currentVersion } from '../utils/updater'

const version = currentVersion()
const build = __BUILD_COMMIT__
const GITHUB = 'https://github.com/Cyrene2008/CyreneAudioSeeker'

function openRepo() {
  if (tauri.isTauri) {
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(GITHUB))
  } else {
    window.open(GITHUB)
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
.about-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(234, 94, 193, 0.3);
}
.about-card h1 { margin: 12px 0 4px; font-size: 22px; }
.about-ver { color: var(--text-secondary); font-size: 13px; }
.about-build { color: var(--text-muted, #a16d88); }
.about-desc { margin: 18px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.about-actions { display: flex; justify-content: center; gap: 10px; }
.about-powered {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted, #a16d88);
}
.powered-text {
  font-family: 'MiSans', 'Segoe UI', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
}
.about-links {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.about-copy { color: var(--text-muted, #999); }
</style>
