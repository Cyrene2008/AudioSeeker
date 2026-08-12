import { defineThemeConfig } from 'vuepress-theme-plume'

const currentYear = new Date().getFullYear()

export default defineThemeConfig({
  logo: '/images/Cyrene.png',

  appearance: true,

  social: [
    { icon: 'github', link: 'https://github.com/Cyrene2008/AudioSeeker' },
    { icon: 'bilibili', link: 'https://space.bilibili.com/1203736702' },
  ],
  navbarSocialInclude: ['github', 'bilibili'],

  /* 过渡动画 @see https://theme-plume.vuejs.press/config/basic/#transition */
  transition: {
    appearance: 'circle-clip', // 配置深色模式切换过渡动画类型
  },

  locales: {
    '/': {
      footer: {
        message: '由 <a target="_blank" href="https://v2.vuepress.vuejs.org/">VuePress</a> & <a target="_blank" href="https://theme-plume.vuejs.press">vuepress-theme-plume</a> 驱动',
        copyright: `© ${currentYear} Cyrene2008 | <a href="https://icp.gov.moe/?keyword=20265293" target="_blank" rel="noopener noreferrer">萌ICP备20265293号</a> | <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer">GPL-3.0</a>`,
      },
    },
    '/en/': {
      footer: {
        message: 'Powered by <a target="_blank" href="https://v2.vuepress.vuejs.org/">VuePress</a> & <a target="_blank" href="https://theme-plume.vuejs.press">vuepress-theme-plume</a>',
        copyright: `© ${currentYear} Cyrene2008 | <a href="https://icp.gov.moe/?keyword=20265293" target="_blank" rel="noopener noreferrer">萌ICP备20265293</a> | <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer">GPL-3.0</a>`,
      },
    },
  },
})
