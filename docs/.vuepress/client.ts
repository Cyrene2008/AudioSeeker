import { defineClientConfig } from 'vuepress/client'
import DownloadPage from './components/DownloadPage.vue'
import './theme/styles/custom.css'

export default defineClientConfig({
  enhance({ app }) {
    app.component('DownloadPage', DownloadPage)
  },
})
