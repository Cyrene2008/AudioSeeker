import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { execSync } from 'node:child_process'

function buildCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [vue()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(buildCommit())
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: { ignored: ['**/src-tauri/**', '**/index/**'] }
  },
  build: {
    target: 'es2021',
    chunkSizeWarningLimit: 2000
  }
})
