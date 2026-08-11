import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { addCollection } from '@iconify/vue'
import fluentIcons from '@iconify-json/fluent/icons.json'
import mdiIcons from '@iconify-json/mdi/icons.json'
import 'vue-fluent-widgets/style.css'
import './assets/css/main.css'
import App from './App.vue'
import { settings, onSettingsChange } from './stores/settings'

// 全局错误捕获：启动阶段（挂载前）的致命错误显示可见面板；运行期错误上报后端日志
let appMounted = false

function reportError(msg, loc = '', stack = '') {
  // 上报到后端 error.log（后端可用时）
  try {
    fetch(`http://127.0.0.1:${window.__CYRENE_PORT__ || 8765}/api/error-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: String(msg).slice(0, 2000),
        location: String(loc).slice(0, 500),
        stack: String(stack).slice(0, 3000)
      })
    }).catch(() => {})
  } catch { /* ignore */ }
}

window.addEventListener('error', (e) => {
  const msg = e.message || String(e.error)
  const loc = `${window.location.hash} @${e.filename || ''}:${e.lineno || ''}`
  reportError(msg, loc, e.error && e.error.stack)
  if (!appMounted) showFatalError(msg)
})
window.addEventListener('unhandledrejection', (e) => {
  const msg = String(e.reason && e.reason.message ? e.reason.message : e.reason)
  reportError(msg, window.location.hash, e.reason && e.reason.stack)
  if (!appMounted) {
    showFatalError(msg)
  }
})

function showFatalError(msg) {
  const el = document.getElementById('app')
  if (!el || el.querySelector('.fatal-error')) return
  const div = document.createElement('div')
  div.className = 'fatal-error'
  div.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:var(--bg-base,#fdf5fa)'
  div.innerHTML = `<div style="max-width:520px;padding:28px;border-radius:14px;background:var(--bg-card-solid,#fff);border:1px solid var(--border-strong);font-family:'MiSans','Segoe UI','Microsoft YaHei',sans-serif">
    <h2 style="margin:0 0 10px;font-size:16px;color:#d13438">程序启动出错</h2>
    <p style="margin:0;font-size:13px;color:var(--text-secondary);word-break:break-all;user-select:text">${msg}</p>
  </div>`
  el.appendChild(div)
}

// 本地注册 Fluent 图标集 + mdi（GitHub 品牌图标）：离线可用
addCollection(fluentIcons)
addCollection(mdiIcons)

// 禁止 Ctrl+A / Meta+A 全选页面文字（输入框除外，与桌面应用行为一致）
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
    const t = e.target
    const editable = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'
      || t.isContentEditable)
    if (!editable) e.preventDefault()
  }
})

// 禁止右键菜单（输入框除外）
window.addEventListener('contextmenu', (e) => {
  const t = e.target
  const editable = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'
    || t.isContentEditable)
  if (!editable) e.preventDefault()
})
function applyTheme() {
  const root = document.documentElement
  root.classList.add('peach')
  root.classList.toggle('dark', settings.dark)
  root.classList.toggle('light', !settings.dark)
  root.lang = settings.lang === 'en' ? 'en' : 'zh-CN'
}
onSettingsChange(applyTheme)
applyTheme()

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/search' },
    { path: '/search', component: () => import('./views/SearchView.vue') },
    { path: '/build', component: () => import('./views/BuildView.vue') },
    { path: '/manage', component: () => import('./views/ManageView.vue') },
    { path: '/favorites', component: () => import('./views/FavoritesView.vue') },
    { path: '/settings', component: () => import('./views/SettingsView.vue') },
    { path: '/about', component: () => import('./views/AboutView.vue') }
  ]
})

const app = createApp(App)

// Vue 渲染错误也接到全局错误面板（避免"白屏无提示"），并上报后端日志
app.config.errorHandler = (err, instance, info) => {
  let loc = ''
  try {
    const route = window.location.hash
    const comp = instance && instance.type && (instance.type.__name || instance.type.name)
    loc = `${route}${comp ? ` @${comp}` : ''}${info ? ` (${info})` : ''}`
  } catch { /* ignore */ }
  const msg = err && err.message ? err.message : String(err)
  reportError(msg, loc, err && err.stack)
  showFatalError(`${msg}\n${loc}`)
}

app.use(router).mount('#app')
appMounted = true
