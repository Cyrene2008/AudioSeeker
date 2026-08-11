<template>
  <div v-if="player.active" class="player-bar">
    <div class="pb-info">
      <button class="pb-close" title="关闭" @click="stopTrack"><Icon icon="fluent:dismiss-24-regular" :width="14" /></button>
      <div class="pb-text">
        <div class="pb-title">{{ player.title }}</div>
        <div class="pb-sub">{{ player.subtitle }}</div>
      </div>
    </div>
    <FluentMediaPlayer
      ref="mpRef"
      :src="player.src"
      type="audio"
      :autoplay="true"
      :loop="false"
      :title="player.title"
      :artist="player.subtitle"
      :height="'96px'"
      :max-height="'96px'"
      :show-picture-in-picture="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FluentMediaPlayer } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import { player, stopTrack } from '../../stores/player'

const mpRef = ref(null)
</script>

<style scoped>
.player-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  min-height: 72px;
  padding: 6px 16px;
  border-top: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-acrylic, #fff);
  overflow: hidden;
}
.pb-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 240px;
  flex-shrink: 0;
}
.pb-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #666);
  cursor: pointer;
}
.pb-close:hover { background: var(--bg-hover, rgba(0, 0, 0, 0.06)); }
.pb-text { min-width: 0; }
.pb-title {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pb-sub {
  font-size: 12px;
  color: var(--text-secondary, #666);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
