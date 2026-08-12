// 设置 Store：持久化到本地文件（后端 {数据目录}/settings.json），不依赖 localStorage
import { reactive } from 'vue'
import { api } from '../utils/api'

export const settings = reactive({
  default_index_dir: '',
  lang: 'zh',
  dark: false, // 默认浅色
  theme: 'peach',
  unload_index_after_search: false
})

const listeners = []
export function onSettingsChange(fn) {
  listeners.push(fn)
}

let syncTimer = null

function emitAndSync() {
  listeners.forEach((fn) => fn())
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    api.put('/api/settings', {
      lang: settings.lang,
      dark: settings.dark,
      theme: settings.theme,
      unload_index_after_search: settings.unload_index_after_search,
      default_index_dir: settings.default_index_dir || undefined
    }).catch(() => { /* 后端未就绪时静默，就绪后由 loadSettingsFromBackend 兜底 */ })
  }, 300)
}

export function updateSettings(patch) {
  Object.assign(settings, patch)
  emitAndSync()
}

export function loadSettingsFromBackend(data) {
  if (!data) return
  if (data.default_index_dir) settings.default_index_dir = data.default_index_dir
  if (data.lang) settings.lang = data.lang
  if (typeof data.dark === 'boolean') settings.dark = data.dark
  if (data.theme) settings.theme = data.theme
  if (typeof data.unload_index_after_search === 'boolean') {
    settings.unload_index_after_search = data.unload_index_after_search
  }
  listeners.forEach((fn) => fn())
}
