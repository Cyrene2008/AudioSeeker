<template>
  <nav class="dock">
    <div class="dock-items">
      <router-link
        v-for="item in mainItems"
        :key="item.to"
        :to="item.to"
        class="dock-item"
        :class="{ active: route.path === item.to }"
        :title="item.label"
      >
        <Icon :icon="item.icon" :width="20" />
        <span class="dock-item-label">{{ item.label }}</span>
      </router-link>
    </div>
    <div class="dock-footer">
      <router-link
        to="/settings"
        class="dock-item"
        :class="{ active: route.path === '/settings' }"
        :title="t('settings')"
      >
        <Icon icon="fluent:settings-24-regular" :width="20" />
        <span class="dock-item-label">{{ t('settings') }}</span>
      </router-link>
      <router-link
        to="/about"
        class="dock-item"
        :class="{ active: route.path === '/about' }"
        :title="t('about')"
      >
        <Icon icon="fluent:info-24-regular" :width="20" />
        <span class="dock-item-label">{{ t('about') }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { t } from '../../utils/i18n'

const route = useRoute()

const mainItems = computed(() => [
  { to: '/search', icon: 'fluent:search-24-regular', label: t('search') },
  { to: '/build', icon: 'fluent:folder-24-regular', label: t('build') },
  { to: '/manage', icon: 'fluent:library-24-regular', label: t('manage') },
  { to: '/favorites', icon: 'fluent:star-24-regular', label: t('favorites') }
])
</script>

<style scoped>
.dock {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 200px;
  height: 100%;
  border-right: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
  background: var(--bg-card, rgba(255, 245, 252, 0.75));
  font-family: var(--font-ui, system-ui, sans-serif);
  overflow: hidden;
}
.dock-items {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  padding: 8px 6px;
  overflow-y: auto;
}
.dock-footer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 6px;
  border-top: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
}
.dock-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--text-secondary, #6b3a55);
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.dock-item:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--text-primary, #1f1f1f);
}
.dock-item.active {
  background: var(--accent-soft, rgba(234, 94, 193, 0.12));
  color: var(--accent, #ea5ec1);
}
.dock-item.active::before {
  position: absolute;
  left: 0;
  top: 10px;
  width: 3px;
  height: 18px;
  border-radius: 0 3px 3px 0;
  background: var(--accent, #ea5ec1);
  content: '';
}
.dock-item-label {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
