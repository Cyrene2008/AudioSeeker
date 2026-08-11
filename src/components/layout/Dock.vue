<template>
  <FluentNavigationView
    class="dock"
    :menu-items="menuItems"
    :show-toggle-button="false"
    :compact-mode="hamburgerOpen"
  >
    <template #footer>
      <router-link to="/settings" class="dock-footer-item"
        :class="{ active: route.path === '/settings' }" :title="t('settings')">
        <Icon icon="fluent:settings-24-regular" :width="20" class="dock-footer-icon" />
        <span v-if="!hamburgerOpen" class="dock-footer-label">{{ t('settings') }}</span>
      </router-link>
      <router-link to="/about" class="dock-footer-item"
        :class="{ active: route.path === '/about' }" :title="t('about')">
        <Icon icon="fluent:info-24-regular" :width="20" class="dock-footer-icon" />
        <span v-if="!hamburgerOpen" class="dock-footer-label">{{ t('about') }}</span>
      </router-link>
    </template>
    <router-view />
  </FluentNavigationView>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { FluentNavigationView } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../../utils/i18n'

defineProps({ hamburgerOpen: Boolean })
const route = useRoute()

// 菜单图标使用库内 FluentIcon 的裸图标名（fluent 集已本地注册）
const menuItems = computed(() => [
  { id: '/search', label: t('search'), icon: 'search-24-regular', to: '/search' },
  { id: '/build', label: t('build'), icon: 'folder-24-regular', to: '/build' },
  { id: '/manage', label: t('manage'), icon: 'library-24-regular', to: '/manage' },
  { id: '/favorites', label: t('favorites'), icon: 'star-24-regular', to: '/favorites' }
])
</script>

<style scoped>
.dock {
  flex-shrink: 0;
  height: 100%;
  min-height: 0;
}
.dock :deep(.navigation-view-pane) {
  width: 168px;
  flex-basis: 168px;
  background: var(--bg-acrylic, #fff);
}
.dock :deep(.navigation-view-content) {
  overflow-y: auto;
  padding: 20px 24px;
}
.dock-footer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 12px;
  margin: 2px 0;
  border-radius: 4px;
  color: var(--text-primary, #3d1a2e);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.dock-footer-item:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
}
.dock-footer-item.active {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--accent, #ea5ec1);
}
.dock-footer-icon {
  flex-shrink: 0;
}
.dock-footer-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
