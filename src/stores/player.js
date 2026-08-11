// 跨页面播放器：在任意页面启动的播放会在底部播放条继续
import { reactive } from 'vue'

export const player = reactive({
  active: false,
  title: '',
  subtitle: '',
  src: '',
  minimized: false
})

export function playTrack({ title, subtitle, src }) {
  player.title = title
  player.subtitle = subtitle || ''
  player.src = src
  player.active = true
  player.minimized = false
}

export function stopTrack() {
  player.active = false
  player.src = ''
}
