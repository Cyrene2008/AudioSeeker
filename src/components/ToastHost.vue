<template>
  <FluentToast ref="toastRef" />
</template>

<script>
// 全局 toast：包装库组件 FluentToast（ref 暴露 add/remove）
let toastAdd = null

export function pushToast({ title, body = '', url = '', seconds = 4 }) {
  if (!toastAdd) return
  toastAdd({
    title,
    message: body || undefined,
    duration: Math.max(1000, seconds * 1000),
    action: url ? { label: '打开', fn: () => openExternal(url) } : undefined
  })
}

function openExternal(url) {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(url))
  } else {
    window.open(url)
  }
}
</script>

<script setup>
import { onMounted, ref } from 'vue'
import { FluentToast } from 'vue-fluent-widgets'

const toastRef = ref(null)

onMounted(() => {
  toastAdd = toastRef.value && toastRef.value.add
})
</script>
