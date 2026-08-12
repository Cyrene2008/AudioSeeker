# Third-Party Notices

[简体中文](#简体中文) | [English](#english)

## 简体中文

Cyreneの音频检索器的项目源代码依据 GNU General Public License v3.0 or later 发布。随程序使用或下载的第三方软件、字体、组件和媒体不因本项目许可证而改变其原有许可。

### VueFluentWidgets

- 项目：<https://fluent.cyrene.hk>
- 仓库/包：`vue-fluent-widgets`
- 许可证：MIT License
- Copyright © 2025–2026 Cyrene2008

### MiSans

- 用途：界面字体
- 许可证：MiSans 字体许可
- 许可信息：<https://hyperos.mi.com/font/download>

### FFmpeg

- 用途：音频解码、转码和播放流处理
- 下载来源：BtbN FFmpeg Builds
- 许可证：取决于下载构建启用的组件，可能适用 GPL/LGPL 及相关第三方许可
- 项目：<https://ffmpeg.org/>

### Python 运行时和 Python 依赖

程序首次启动时会下载 Python 运行时，并通过 pip 安装 `numpy`、`scipy`、`soundfile`、`librosa`、`fastapi` 和 `uvicorn`。这些项目保留各自许可证。安装后的包通常包含对应的许可证或元数据。

### Rust 和 JavaScript 依赖

Tauri、Vue、Vite、Iconify 及 Cargo/npm 依赖保留各自许可证。完整版本集合可由 `Cargo.lock` 和 `package-lock.json` 确定。

## English

The source code of Cyrene's Audio Seeker is released under the GNU General Public License v3.0 or later. Third-party software, fonts, components, and media used or downloaded by the application retain their original licenses.

### VueFluentWidgets

- Project: <https://fluent.cyrene.hk>
- Package: `vue-fluent-widgets`
- License: MIT License
- Copyright © 2025–2026 Cyrene2008

### MiSans

- Purpose: user-interface font
- License: MiSans font license
- License information: <https://hyperos.mi.com/font/download>

### FFmpeg

- Purpose: audio decoding, transcoding, and playback streaming
- Distribution source: BtbN FFmpeg Builds
- License: depends on the enabled build components and may include GPL/LGPL and other third-party terms
- Project: <https://ffmpeg.org/>

### Python Runtime and Python Dependencies

The application downloads a Python runtime on first launch and installs `numpy`, `scipy`, `soundfile`, `librosa`, `fastapi`, and `uvicorn` through pip. These projects retain their respective licenses. Installed packages generally include their license files or metadata.

### Rust and JavaScript Dependencies

Tauri, Vue, Vite, Iconify, and the remaining Cargo/npm dependencies retain their respective licenses. The exact dependency versions are recorded in `Cargo.lock` and `package-lock.json`.
