<template>
  <nav ref="dockRef" class="dock" :class="{ collapsed: hamburgerOpen }">
    <div
      v-show="indicatorVisible"
      ref="indicatorRef"
      class="dock-indicator"
      aria-hidden="true"
    />
    <div class="dock-items">
      <router-link v-for="item in mainItems" :key="item.to" :to="item.to"
        ref="itemsRef" class="dock-item"
        :class="{ active: route.path === item.to }" :title="item.label">
        <Icon :icon="item.icon" :width="20" class="dock-item-icon" />
        <span v-if="!hamburgerOpen" class="dock-item-label">{{ item.label }}</span>
      </router-link>
    </div>
    <div class="dock-bottom">
      <router-link to="/settings" ref="itemsRef" class="dock-item" :class="{ active: route.path === '/settings' }" :title="t('settings')">
        <Icon icon="fluent:settings-24-regular" :width="20" class="dock-item-icon" />
        <span v-if="!hamburgerOpen" class="dock-item-label">{{ t('settings') }}</span>
      </router-link>
      <router-link to="/about" ref="itemsRef" class="dock-item" :class="{ active: route.path === '/about' }" :title="t('about')">
        <Icon icon="fluent:info-24-regular" :width="20" class="dock-item-icon" />
        <span v-if="!hamburgerOpen" class="dock-item-label">{{ t('about') }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import { Icon } from '@iconify/vue'
import { t } from '../../utils/i18n'

defineProps({ hamburgerOpen: Boolean })
const route = useRoute()

const mainItems = computed(() => [
  { to: '/search', icon: 'fluent:search-24-regular', label: t('search') },
  { to: '/build', icon: 'fluent:folder-24-regular', label: t('build') },
  { to: '/manage', icon: 'fluent:library-24-regular', label: t('manage') },
  { to: '/favorites', icon: 'fluent:star-24-regular', label: t('favorites') }
])

const dockRef = ref(null)
const indicatorRef = ref(null)
const indicatorVisible = ref(false)

// 活动指示器：竖条在选中项左侧，带移动/拉伸动画（参考 NameRoller）
function syncIndicator(animate = false) {
  const dock = dockRef.value
  const ind = indicatorRef.value
  if (!dock || !ind) return
  const target = dock.querySelector('.dock-item.active')
  if (!target) {
    indicatorVisible.value = false
    return
  }
  const dockRect = dock.getBoundingClientRect()
  const tRect = target.getBoundingClientRect()
  const top = tRect.top - dockRect.top
  const height = tRect.height
  indicatorVisible.value = true
  gsap.killTweensOf(ind)
  if (!animate) {
    gsap.set(ind, { top, height, opacity: 1 })
    return
  }
  // 先移动到目标位置，再拉伸到目标高度（两段动画）
  gsap.set(ind, { top, height, opacity: 1 })
  gsap.fromTo(ind,
    { top: top + height * 0.5, height: 4, opacity: 0 },
    { top, height, opacity: 1, duration: 0.22, ease: 'power2.out' })
}

watch(() => route.path, () => {
  nextTick(() => syncIndicator(true))
})

onMounted(() => {
  nextTick(() => syncIndicator(false))
})
</script>

<style scoped>
.dock {
  position: relative;
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
.dock-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--accent, #ea5ec1);
  pointer-events: none;
  z-index: 3;
}
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
  position: relative;
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
.dock-item.active { background: var(--accent-soft, rgba(234, 94, 193, 0.12)); color: var(--accent, #ea5ec1); }
.dock.collapsed .dock-item { justify-content: center; padding: 8px 0; }
.dock-item-icon { flex-shrink: 0; }
.dock-item-label { overflow: hidden; text-overflow: ellipsis; }
</style>
