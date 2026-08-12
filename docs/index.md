---
home: true
config:
  - type: doc-hero
    background: tint-plate
    hero:
      name: Cyreneの音频检索器
      text: 音频指纹检索桌面应用
      tagline: 为大型音频库建立本地指纹索引，用任意长度的样本定位源文件与时间偏移
      image: /images/Cyrene.png
      actions:
        - theme: brand
          text: 下载客户端
          icon: lucide:download
          link: /download.html
        - theme: alt
          text: 阅读文档
          icon: lucide:list-start
          link: /doc/guide/start
        - theme: alt
          text: GitHub 仓库
          icon: fa-brands:github
          link: https://github.com/Cyrene2008/AudioSeeker

  - type: features
    features:
      - title: 指纹检索
        icon: lucide:search
        details: 通过短片段、混剪或重编码样本，定位源文件与文件内偏移。
      - title: 多格式支持
        icon: lucide:audio-waveform
        details: 支持 WAV、FLAC、MP3、OGG、AAC、M4A、WMA、AIFF 等常见音频格式。
      - title: 本地索引
        icon: lucide:database
        details: 支持按内存分段与增量构建，索引常驻内存缓存，连续检索无需重复加载。
      - title: 完整播放
        icon: lucide:play
        details: 从命中偏移开始播放完整源文件，跨页面持续播放。
      - title: 收藏与导出
        icon: lucide:star
        details: 收藏、取消收藏、资源管理器定位，按时间线拼接导出结果。
      - title: 开源免费
        icon: lucide:heart
        details: 基于 GPLv3 开源，界面由 Vue + VueFluentWidgets 构建。
---

## 项目仓库

[Cyrene2008/AudioSeeker](https://github.com/Cyrene2008/AudioSeeker)

## 许可证

本项目依据 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html) 发布。
