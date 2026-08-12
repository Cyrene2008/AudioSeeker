import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'

import { zhNavbar, enNavbar } from './navbar'

export default defineUserConfig({
  base: '/',
  lang: 'zh-CN',
  title: 'Cyreneの音频检索器',
  description: '基于音频指纹的本地素材检索桌面应用（Vue 3 + Tauri 2）',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/Cyrene.png' }],
  ],

  bundler: viteBundler(),
  shouldPrefetch: false,

  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Cyreneの音频检索器',
      description: '基于音频指纹的本地素材检索桌面应用（Vue 3 + Tauri 2）',
    },
    '/en/': {
      lang: 'en-US',
      title: "Cyrene's Audio Seeker",
      description: 'Audio fingerprint search desktop app based on Vue 3 + Tauri 2',
    },
  },

  theme: plumeTheme({
    hostname: 'https://audioseeker.cyrene.hk',

    docsRepo: 'https://github.com/Cyrene2008/AudioSeeker',
    docsDir: 'docs',
    docsBranch: 'Cyrene',

    llmstxt: true,

    contributors: {
      mode: 'block',
      avatar: 'github',
      contributors: [
        {
          name: 'Cyrene2008',
          avatar: 'https://github.com/Cyrene2008.png',
          url: 'https://github.com/Cyrene2008',
        },
      ],
    },

    changelog: true,
    cache: 'filesystem',

    search: {
      provider: 'local',
    },

    markdown: {
      icon: { provider: 'iconify', size: '1.5rem' },
      table: {
        align: 'center',
      },
      field: true,
    },

    locales: {
      '/': {
        nav: zhNavbar,
        sidebar: {
          '/doc/': [
            {
              text: '指南',
              link: '/doc/guide/start',
              items: [
                { text: '快速开始', link: '/doc/guide/start' },
                { text: '功能说明', link: '/doc/guide/features' },
                { text: '技术说明', link: '/doc/guide/technical' },
              ],
            },
          ],
        },
      },
      '/en/': {
        nav: enNavbar,
        sidebar: {
          '/en/doc/': [
            {
              text: 'Guide',
              link: '/doc/guide/start',
              items: [
                { text: 'Getting Started', link: '/doc/guide/start' },
                { text: 'Features', link: '/doc/guide/features' },
                { text: 'Technical Notes', link: '/doc/guide/technical' },
              ],
            },
          ],
        },
      },
    },
  }),
})
