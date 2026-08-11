import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { addCollection } from '@iconify/vue'
import fluentIcons from '@iconify-json/fluent/icons.json'
import 'vue-fluent-widgets/style.css'
import './assets/css/main.css'
import App from './App.vue'
import { settings, onSettingsChange } from './stores/settings'

// 本地注册 Fluent 图标集：离线可用（不依赖 iconify 在线 API）
addCollection(fluentIcons)

// 主题：peach（桃粉）+ 深色，跟随设置
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

createApp(App).use(router).mount('#app')
