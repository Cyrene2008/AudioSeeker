<template>
  <div class="version-badge" :title="`build ${build}`">
    <span class="vb-text">v{{ version }}<span v-if="build" class="vb-build"> · build {{ build }}</span></span>
  </div>
</template>

<script setup>
import { currentVersion } from '../utils/updater'

defineProps({
  version: { type: String, default: () => currentVersion() },
  build: { type: String, default: () => __BUILD_COMMIT__ }
})
</script>

<style scoped>
.version-badge {
  position: fixed;
  right: 14px;
  bottom: 10px;
  z-index: 600;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bg-card-solid, #fff8fc);
  border: 1px solid var(--border-subtle, rgba(234, 94, 193, 0.15));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  user-select: text;
}
.vb-text {
  font-family: 'MiSans', 'Segoe UI', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
  line-height: 1;
  color: var(--text-secondary, #6b3a55);
  white-space: nowrap;
}
.vb-build {
  color: var(--text-muted, #a16d88);
}
</style>
