// 后端状态：全局追踪后端健康，供各页面共用
import { reactive } from 'vue'
import { checkHealth } from '../utils/api'

export const backendState = reactive({
  ready: false,
  lastCheck: 0,
})

let checking = false
let pollTimer = null

export async function pollBackend(interval = 8000) {
  if (checking) return
  checking = true
  while (true) {
    const ok = await checkHealth()
    backendState.ready = ok
    backendState.lastCheck = Date.now()
    if (ok) break
    await new Promise(r => setTimeout(r, interval))
    // 就绪后降低轮询频率
    if (backendState.ready) {
      clearInterval(pollTimer)
      pollTimer = setInterval(async () => {
        backendState.ready = await checkHealth()
        backendState.lastCheck = Date.now()
      }, 30000)
      break
    }
  }
  checking = false
}

export function startBackendPoll() {
  pollBackend()
}
