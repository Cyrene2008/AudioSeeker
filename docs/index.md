---
home: true
config:
  - type: hero
    full: true
    background: linear-gradient(135deg, #ffd9ec 0%, #fdf5fa 45%, #ffcfe8 100%)
    hero:
      name: Cyreneの音频检索器
      tagline: 面向大型音频素材库的本地指纹检索工具
      text: 为音频目录建立指纹索引，用任意长度的样本定位源文件与时间偏移
      actions:
        - theme: brand
          text: 快速开始
          link: /doc/guide/start
        - theme: alt
          text: GitHub
          link: https://github.com/Cyrene2008/AudioSeeker
  - type: features
    features:
      - icon: 🔍
        title: 指纹检索
        details: 通过短片段、混剪或重编码样本，定位源文件与文件内偏移。
      - icon: 🗂️
        title: 本地索引
        details: 为大型音频目录建立本地指纹索引，支持分段与增量构建。
      - icon: ▶️
        title: 完整播放
        details: 从命中偏移开始播放完整源文件，跨页面持续播放。
      - icon: ⭐
        title: 收藏与导出
        details: 收藏、取消收藏、资源管理器定位，以及按时间线拼接导出结果。
---

## Cyrene's Audio Seeker

一款面向大型音频素材库的 Windows 桌面检索应用。程序为音频目录建立本地指纹索引，并从短片段、混剪、录屏提取音频或重编码样本中定位原始文件与时间偏移。

- 项目仓库：[Cyrene2008/AudioSeeker](https://github.com/Cyrene2008/AudioSeeker)
- 开源协议：[GPL v3](../LICENSE)
- 界面组件：[VueFluentWidgets](https://fluent.cyrene.hk)
