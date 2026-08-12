<template>
  <div class="page page-scroll about-page">
    <section class="about-identity">
      <img :src="avatar" class="about-avatar" alt="Cyrene2008" />
      <div>
        <h1>Cyreneの音频检索器</h1>
        <div class="about-en">Cyrene's Audio Seeker</div>
        <div class="about-ver mono">v{{ version }}<span v-if="build" class="about-build"> · build {{ build }}</span></div>
      </div>
    </section>

    <p class="about-desc">{{ t('aboutDescription') }}</p>

    <section class="about-section powered-section">
      <Icon icon="fluent:code-24-regular" :width="24" />
      <div>
        <h2>Powered by VueFluentWidgets</h2>
        <p>Fluent Design System for Vue · MIT License</p>
        <p>Copyright © 2025–2026 Cyrene2008</p>
        <FluentHyperlinkButton href="https://fluent.cyrene.hk" target="_blank" label="https://fluent.cyrene.hk" />
      </div>
    </section>

    <div class="about-grid">
      <section class="about-section">
        <h2>{{ t('githubRepo') }}</h2>
        <FluentHyperlinkButton :href="GITHUB" target="_blank" label="github.com/Cyrene2008/AudioSeeker" />
      </section>

      <section class="about-section">
        <h2>{{ t('license') }}</h2>
        <p>GNU General Public License v3.0</p>
        <p>{{ t('licenseSummary') }}</p>
        <FluentHyperlinkButton href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" :label="t('viewLicense')" />
      </section>
    </div>

    <section class="about-section legal-section">
      <h2>{{ t('copyright') }}</h2>
      <p>Copyright © 2025–2026 Cyrene2008</p>
      <p>{{ t('noWarranty') }}</p>
    </section>
  </div>
</template>

<script setup>
import { FluentHyperlinkButton } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import avatar from '../assets/avatars/Cyrene2008.png'
import { t } from '../utils/i18n'
import { currentVersion } from '../utils/updater'

const version = currentVersion()
const build = __BUILD_COMMIT__
const GITHUB = 'https://github.com/Cyrene2008/AudioSeeker'
</script>

<style scoped>
.about-page { width: min(780px, 100%); margin: 0 auto; padding-bottom: 8px; }
.about-identity { display: flex; align-items: center; gap: 20px; padding: 8px 0 18px; }
.about-avatar { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 16px rgba(234, 94, 193, .24); }
.about-identity h1 { margin: 0; font-size: 24px; }
.about-en { margin-top: 3px; color: var(--text-secondary); font-size: 14px; }
.about-ver { margin-top: 7px; color: var(--text-secondary); font-size: 12px; }
.about-build { color: var(--text-muted); }
.about-desc { margin: 0 0 18px; max-width: 68ch; color: var(--text-secondary); font-size: 14px; line-height: 1.7; }
.about-section { padding: 18px; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-card-solid); }
.about-section h2 { margin: 0 0 8px; font-size: 15px; }
.about-section p { margin: 4px 0; color: var(--text-secondary); font-size: 13px; line-height: 1.6; }
.powered-section { display: flex; align-items: flex-start; gap: 14px; }
.powered-section > svg { flex: 0 0 auto; margin-top: 2px; color: var(--accent); }
.powered-section :deep(.fluent-hyperlink-button), .about-grid :deep(.fluent-hyperlink-button) { padding-inline: 0; overflow-wrap: anywhere; text-align: left; }
.about-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
.legal-section { margin-top: 12px; }
@media (max-width: 680px) {
  .about-grid { grid-template-columns: 1fr; }
  .about-identity { align-items: flex-start; }
}
</style>
