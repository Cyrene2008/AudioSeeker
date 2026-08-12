<template>
  <div v-if="player.active" class="player-bar">
    <button class="pb-close" :title="t('close')" @click="stopTrack"><Icon icon="fluent:dismiss-24-regular" :width="16" /></button>
    <FluentMediaPlayer
      ref="mpRef"
      class="pb-player"
      :src="player.src"
      type="audio"
      :autoplay="true"
      :loop="false"
      :poster="cover"
      :title="player.title"
      :artist="player.subtitle"
      :show-picture-in-picture="false"
      @loadedmetadata="seekToStart"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FluentMediaPlayer } from 'vue-fluent-widgets'
import { Icon } from '@iconify/vue'
import cover from '../../assets/avatars/Cyrene2008.png'
import { player, stopTrack } from '../../stores/player'
import { t } from '../../utils/i18n'

const mpRef = ref(null)

function seekToStart() {
  if (player.startTime > 0) mpRef.value?.seek(player.startTime)
}
</script>

<style scoped>
.player-bar {
  position: relative;
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  padding: 10px 16px 12px;
  border-top: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  background: var(--bg-acrylic, #fff);
  overflow: visible;
}
.pb-close {
  position: absolute;
  top: 16px;
  right: 22px;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #666);
  cursor: pointer;
}
.pb-close:hover { background: var(--bg-hover, rgba(0, 0, 0, 0.06)); }
.pb-player {
  flex: 1;
  min-width: 0;
}
@media (max-height: 650px) {
  .player-bar { padding-block: 6px; }
  .pb-player :deep(.audio-stage) { min-height: 84px; padding: 10px 48px 10px 12px; }
  .pb-player :deep(.audio-artwork) { flex-basis: 56px; width: 56px; height: 56px; }
  .pb-close { top: 12px; }
}
</style>
