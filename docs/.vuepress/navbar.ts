/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

const zhNavbar = defineNavbarConfig([
  {
    text: '指南',
    icon: 'ep:guide',
    link: '/doc/guide/start',
  },
  {
    text: '技术说明',
    icon: 'lucide:file-code',
    link: '/doc/guide/technical',
  },
  {
    text: '下载',
    icon: 'ic:outline-download',
    link: '/download.html',
  },
])

const enNavbar = defineNavbarConfig([
  {
    text: 'Guide',
    icon: 'ep:guide',
    link: '/en/doc/guide/start',
  },
  {
    text: 'Technical',
    icon: 'lucide:file-code',
    link: '/en/doc/guide/technical',
  },
  {
    text: 'Download',
    icon: 'ic:outline-download',
    link: '/en/download.html',
  },
])

export { zhNavbar, enNavbar }
