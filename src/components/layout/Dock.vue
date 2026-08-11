<template>
  <FluentNavigationView
    class="dock"
    :menu-items="menuItems"
    :show-toggle-button="false"
    :default-selected-item="route.path"
  >
    <template #footer>
      <router-link to="/settings" class="dock-footer-item"
        :class="{ active: route.path === '/settings' }" :title="t('settings')">
        <Icon icon="fluent:settings-24-regular" :width="20" />
        <span class="dock-footer-label">{{ t('settings') }}</span>
      </router-link>
      <router-link to="/about" class="dock-footer-item"
        :class="{ active: route.path === '/about' }" :title="t('about')">
        <Icon icon="fluent:info-24-regular" :width="20" />
        <span class="dock-footer-label">{{ t('about') }}</span>
      </router-link>
    </template>
    <router-view v-slot="{ Component }">
      <transition name="page-forward" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </FluentNavigationView>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { FluentNavigationView } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { t } from '../../utils/i18n'

const route = useRoute()

// 图标使用库内 FluentIcon 的裸图标名（FluentIcon 自动补 fluent: 前缀）
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
/* 内容区排版：内边距 + 弹性布局占满可用区域 + 内部滚动（组件自带 overflow:auto） */
.dock :deep(.navigation-view-content) {
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
}
.dock :deep(.navigation-view-content > *) {
  min-height: 0;
}
.dock-footer-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 36px;
  padding: 0 12px;
  margin: 2px 4px;
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
.dock-footer-item.active::before {
  position: absolute;
  left: -4px;
  top: 10px;
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: var(--accent, #ea5ec1);
  content: '';
}
.dock-footer-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
