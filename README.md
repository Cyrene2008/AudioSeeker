# Cyreneの音频检索器

**Cyrene's Audio Seeker**

[English](README_EN.md) | **简体中文**

[![Release](https://github.com/Cyrene2008/AudioSeeker/actions/workflows/release.yml/badge.svg)](https://github.com/Cyrene2008/AudioSeeker/actions/workflows/release.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4.svg)](#系统要求)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB.svg)](https://tauri.app/)
[![Vue](https://img.shields.io/badge/Vue-3-42B883.svg)](https://vuejs.org/)

Cyreneの音频检索器是一款面向大型音频素材库的 Windows 桌面检索工具。程序会为音频目录建立本地指纹索引，并从短片段、混剪、录屏提取音频或重编码样本中定位原始文件与时间偏移。

> [!CAUTION]
> Made with ❤️ by [Cyrene2008](https://github.com/Cyrene2008)
> 
> Powered by [Vue Fluent Widgets](https://fluent.cyrene.hk)

## 主要功能

- 为大型音频目录（WAV、FLAC、MP3、OGG、OPUS、AAC、M4A、WMA、AIFF 等）建立本地指纹索引。
- 通过短片段或长样本定位源文件与文件内偏移。
- 支持指定样本起止时间、最低命中数和最低置信度。
- 可按文件名合并结果，并使用同名结果中的最高置信度展示。
- 支持分段索引，目标加载内存使用明确的 MB 单位。
- 支持增量构建，只处理尚未进入索引的新文件。
- 检索任务在切换页面后继续运行，返回检索页即可查看状态或结果。
- 索引默认保留在内存缓存中，提高连续检索效率。
- 可在设置中启用“检索后卸载索引”以节省内存。
- 支持从命中偏移开始播放完整源文件。
- 支持收藏、取消收藏、资源管理器定位和结果拼接导出。
- 提供检索历史、索引管理、中英文界面和更新检查。

## 页面展示

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/f994206b-bd52-45e7-8123-a4b80831575e" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/a955f98b-c042-489b-bc87-feb2f756dc19" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/dce1c101-1239-4910-b4c7-72f11e73cad6" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/87c4c1cb-27fa-4289-8d49-06dd2bb2e0d7" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/dcc2abb5-1694-44cd-9b83-481408b01ef3" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/89ce4576-9fb3-47ae-aa11-07de157662d8" />

## 系统要求

- Windows 10 或 Windows 11，64 位。
- 无需网络：Python 运行时、依赖、FFmpeg 均已移除或随安装包内置，安装即用。
- 建议使用 SSD 存放大型索引。
- 构建和加载大型索引需要足够的磁盘空间与内存。

程序采用当前用户安装模式，不要求管理员权限。默认索引目录位于软件安装目录下的 `index` 文件夹；设置、收藏、历史和注册信息位于当前用户的应用数据目录。

## 安装

1. 从 [GitHub Releases](https://github.com/Cyrene2008/AudioSeeker/releases) 下载最新的 Windows 安装包。
2. 运行 `AudioSeeker_<版本>_x64-setup.exe`（安装器语言自动跟随系统语言）。
3. 启动后直接进入主界面，无需等待任何运行环境准备。
4. 进入“构建索引”页面选择音频目录并创建第一个索引。

v26.1.0 起为单进程本地引擎：指纹识别与索引均由内置 Rust 引擎完成
（`.casi` 二进制索引，mmap 零解析加载），无任何启动期下载与后台进程引导。

## 快速使用

### 1. 构建索引

1. 打开“构建索引”。
2. 选择包含音频文件（WAV、FLAC、MP3、OGG、AAC、M4A 等常见格式）的目录。
3. 输入索引名称。
4. 设置线程数。
5. 设置目标段加载内存，单位为 MB。
6. 根据目录结构决定是否启用递归扫描。
7. 开始构建并等待任务完成。

目标段加载内存表示每个索引段预计加载到内存时的目标大小，并不是严格的索引文件大小上限。`0` 表示不主动分段。单个大型文件不会被拆开，因此实际内存占用可能高于目标值。

### 2. 增量构建

1. 切换到“增量构建”。
2. 选择已有索引和音频源目录。
3. 程序会使用该索引首次构建时记录的分段 MB 值作为默认值。
4. 开始构建后，仅未进入索引的新音频文件会被处理。

旧版或外部导入索引可能没有分段元数据，此时默认显示 `0 MB`。用户可以根据实际情况调整。

### 3. 检索音频

1. 打开“开始检索”。
2. 选择索引或索引分段。
3. 选择样本音频。
4. 按需调整样本区间与阈值。
5. 开始检索。

检索进度无法准确量化，因此界面使用不确定进度环。切换到其他页面不会取消检索；返回检索页后会继续显示运行状态，任务完成后会直接显示结果。

### 4. 结果操作

- 播放：从匹配到的文件偏移开始播放，一直播到源文件结尾。
- 收藏：点击空心星加入收藏，再次点击实心星取消收藏。
- 定位：在 Windows 资源管理器中定位源文件。
- 合并同名文件：将同名结果合并为一行，展示最高置信度结果。
- 导出：将匹配到的源文件（完整音频文件）复制到所选文件夹。

## 索引缓存与内存

后端默认缓存最近加载的索引分段，以便连续检索同一索引时避免重复加载。缓存使用 LRU 策略，并限制同时保留的分段数量。

内存较小的设备可以在“设置”中启用“检索后卸载索引”。开启后每次检索结束都会释放本次使用的索引分段；下一次检索同一索引时需要重新加载，因此首次响应会更慢。

## 数据与目录

| 内容 | 默认位置 |
| --- | --- |
| 应用程序、FFmpeg（内置解码器） | 软件安装目录 |
| 新建索引 | `<软件安装目录>\index` |
| 设置、收藏、历史、索引注册信息 | 当前用户应用数据目录 |
| 临时音频和构建进度 | 应用数据目录下的临时目录 |

用户可以在设置中修改默认索引保存位置。修改不会移动或影响已经建立、注册或导入的索引。

## 支持的音频

- 索引构建支持 WAV、FLAC、MP3、OGG、OGA、OPUS、AAC、M4A、MP4、WMA、AIFF 等常见音频格式。
- 样本选择支持与索引构建相同的格式列表。
- 播放与转码依赖 FFmpeg。

## 项目架构

- Vue 3 + Vite：桌面界面与状态管理。
- [VueFluentWidgets](https://fluent.cyrene.hk)：Fluent Design 组件库，MIT License。
- Tauri 2 + Rust：窗口、安装包、运行时引导和后端进程管理。
- FastAPI + Python：索引管理、匹配、音频流、导出、收藏和设置 API。
- SQLite + NumPy：指纹分片存储与内存匹配。

## 本地开发

### 环境

- Node.js 20 或更高版本。
- Rust stable 工具链。
- Tauri 2 的 Windows 构建依赖。

### 启动

```powershell
bun install
bun run sync:backend
bun run tauri dev
```

### 验证

```powershell
bun run build
python -m py_compile backend/server.py backend/build_index.py
cargo check --manifest-path src-tauri/Cargo.toml
```

### 打包

```powershell
bun run build:app
```

安装包输出到：

```text
src-tauri/target/release/bundle/nsis/
```

## 仓库结构

```text
backend/                  Python 后端与指纹引擎
src/                      Vue 前端
src/stores/               跨页面状态与共享缓存
src/views/                检索、构建、管理、收藏、设置、关于
src-tauri/                Tauri/Rust 桌面外壳
scripts/                  后端同步与安装包重命名脚本
docs/                     项目文档
```

## 常见问题

### 首次启动一直在准备依赖

请确认网络可访问 Python、PyPI 和 GitHub 镜像。也可以先进入界面，后端会继续启动。

### 管理索引页面统计加载较慢

程序会优先展示缓存的索引列表，再后台读取文件数、哈希数和磁盘占用。大型 SQLite 索引首次统计可能需要一定时间。

### 连续检索同一索引仍然需要重新加载

检查是否启用了“检索后卸载索引”。关闭该设置后，最近使用的索引分段会保留在内存缓存中。

### 递归扫描为何没有目录范围提示

启用递归扫描后程序会进入子目录，因此不会显示“只扫描第一层”的确认提示。关闭递归扫描时会显示该提示。

## 许可证

本项目代码依据 [GNU General Public License v3.0](LICENSE) 发布。你可以使用、研究、修改和分发本项目，但分发衍生作品时必须遵守 GPLv3 的源代码与同许可证要求。

本程序不提供任何担保。完整第三方声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。第三方组件、字体、运行时和依赖保留各自的版权与许可：

- [VueFluentWidgets](https://fluent.cyrene.hk)：MIT License，Copyright © 2025–2026 Cyrene2008。
- MiSans：遵循 MiSans 字体许可。
- Python、Rust、JavaScript 依赖：遵循各自的软件许可。
- FFmpeg：具体许可取决于下载的构建版本和启用功能。

Copyright © 2025–2026 Cyrene2008
