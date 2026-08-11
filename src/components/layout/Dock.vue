<template>
  <nav class="dock" :class="{ collapsed: hamburgerOpen }">
    <div class="dock-top">
      <span class="dock-logo">
        <Icon icon="fluent:headphones-sound-wave-24-filled" :width="24" />
      </span>
      <span v-if="!hamburgerOpen" class="dock-logo-text">Cyrene<br /><small>音频检索器</small></span>
    </div>
    <div class="dock-items">
      <router-link v-for="item in mainItems" :key="item.to" :to="item.to"
        class="dock-item" :class="{ active: route.path === item.to }" :title="item.label">
        <Icon :icon="item.icon" :width="20" class="dock-item-icon" />
        <span v-if="!hamburgerOpen" class="dock-item-label">{{ item.label }}</span>
      </router-link>
    </div>
    <div class="dock-bottom">
      <router-link to="/settings" class="dock-item" :class="{ active: route.path === '/settings' }" :title="t('settings')">
        <Icon icon="fluent:settings-24-regular" :width="20" class="dock-item-icon" />
        <span v-if="!hamburgerOpen" class="dock-item-label">{{ t('settings') }}</span>
      </router-link>
      <router-link to="/about" class="dock-item" :class="{ active: route.path === '/about' }" :title="t('about')">
        <Icon icon="fluent:info-24-regular" :width="20" class="dock-item-icon" />
        <span v-if="!hamburgerOpen" class="dock-item-label">{{ t('about') }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { t } from '../../utils/i18n'

defineProps({ hamburgerOpen: Boolean })
const route = useRoute()

const mainItems = computed(() => [
  { to: '/search', icon: 'fluent:search-24-regular', label: t('search') },
  { to: '/build', icon: 'fluent:database-plug-connected-24-regular', label: t('build') },
  { to: '/manage', icon: 'fluent:library-24-regular', label: t('manage') },
  { to: '/favorites', icon: 'fluent:star-24-regular', label: t('favorites') }
])
</script>

<style scoped>
.dock {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 168px;
  height: 100%;
  border-right: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
  background: var(--bg-acrylic, #fff);
  transition: width 0.2s ease;
}
.dock.collapsed { width: 48px; }
.dock-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
  overflow: hidden;
}
.dock-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff6fb0, #ea5ec1);
  color: #fff;
}
.dock-logo-text {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary, #1f1f1f);
  white-space: nowrap;
}
.dock-logo-text small { color: var(--text-secondary, #666); font-weight: 400; }
.dock-items {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  padding: 10px 6px;
  overflow-y: auto;
}
.dock-bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 6px;
  border-top: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
}
.dock-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--text-secondary, #666);
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.15s, color 0.15s;
}
.dock-item:hover { background: var(--bg-hover, rgba(0, 0, 0, 0.05)); color: var(--text-primary); }
.dock-item.active { background: var(--accent-soft, rgba(255, 105, 160, 0.14)); color: var(--accent, #ea5ec1); }
.dock.collapsed .dock-item { justify-content: center; padding: 8px 0; }
.dock-item-icon { flex-shrink: 0; }
.dock-item-label { overflow: hidden; text-overflow: ellipsis; }
</style>
