<template>
  <div class="toast-host">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" @click="onClick(t)">
        <div class="toast-title">{{ t.title }}</div>
        <div v-if="t.body" class="toast-body">{{ t.body }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

export function pushToast({ title, body = '', url = '', seconds = 4 }) {
  const id = ++seq
  toasts.push({ id, title, body, url })
  setTimeout(() => {
    const i = toasts.findIndex((x) => x.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }, seconds * 1000)
}
</script>

<script setup>
import { tauri } from '../utils/api'

function onClick(t) {
  if (!t.url) return
  if (tauri.isTauri) {
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(t.url))
  } else {
    window.open(t.url)
  }
}
</script>

<style scoped>
.toast-host {
  position: fixed;
  top: 52px;
  right: 16px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 320px;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--bg-card-solid, #fff);
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
.toast-title { font-size: 13px; font-weight: 600; }
.toast-body {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary, #666);
  max-height: 72px;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-all;
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(24px); }
</style>
