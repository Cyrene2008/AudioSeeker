// 跨页面播放器：在任意页面启动的播放会在底部播放条继续
import { reactive } from 'vue'

export const player = reactive({
  active: false,
  title: '',
  subtitle: '',
  src: '',
  startTime: 0,
  minimized: false
})

export function playTrack({ title, subtitle, src, startTime = 0 }) {
  player.title = title
  player.subtitle = subtitle || ''
  player.src = src
  player.startTime = Math.max(0, Number(startTime) || 0)
  player.active = true
  player.minimized = false
}

export function stopTrack() {
  player.active = false
  player.src = ''
  player.startTime = 0
}
