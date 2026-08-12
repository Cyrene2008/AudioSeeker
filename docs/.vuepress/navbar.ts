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
    text: '功能',
    icon: 'lucide:sparkles',
    link: '/doc/guide/features',
  },
  {
    text: '下载',
    icon: 'ic:outline-download',
    link: 'https://github.com/Cyrene2008/AudioSeeker/releases',
  },
])

const enNavbar = defineNavbarConfig([
  {
    text: 'Guide',
    icon: 'ep:guide',
    link: '/en/doc/guide/start',
  },
  {
    text: 'Download',
    icon: 'ic:outline-download',
    link: 'https://github.com/Cyrene2008/AudioSeeker/releases',
  },
])

export { zhNavbar, enNavbar }
