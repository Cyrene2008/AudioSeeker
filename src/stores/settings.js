// 设置 Store：与后端 /api/settings 同步，启动前用 localStorage 兜底
import { reactive } from 'vue'

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem('cyrene-audio-settings') || '{}')
  } catch {
    return {}
  }
})()

export const settings = reactive({
  default_index_dir: '',
  lang: saved.lang || 'zh',
  dark: saved.dark !== undefined ? saved.dark : true,
  theme: saved.theme || 'peach',
  _listeners: []
})

settings.onChange = (fn) => settings._listeners.push(fn)

function emit() {
  try {
    localStorage.setItem('cyrene-audio-settings',
      JSON.stringify({ lang: settings.lang, dark: settings.dark, theme: settings.theme }))
  } catch { /* ignore */ }
  settings._listeners.forEach((fn) => fn())
}

export function loadSettingsFromBackend(data) {
  if (data && data.default_index_dir) settings.default_index_dir = data.default_index_dir
  if (data && data.lang) settings.lang = data.lang
  if (data && typeof data.dark === 'boolean') settings.dark = data.dark
  emit()
}

export function applySettings(patch) {
  Object.assign(settings, patch)
  emit()
}

export function syncSettingsToBackend(api) {
  api.put('/api/settings', {
    lang: settings.lang,
    dark: settings.dark,
    theme: settings.theme,
    default_index_dir: settings.default_index_dir || undefined
  }).catch(() => {})
}
