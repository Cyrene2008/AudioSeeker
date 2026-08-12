# Cyreneの音频检索器

**Cyrene's Audio Seeker**

[English](README_EN.md) | **简体中文**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4.svg)](#系统要求)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB.svg)](https://tauri.app/)
[![Vue](https://img.shields.io/badge/Vue-3-42B883.svg)](https://vuejs.org/)

Cyreneの音频检索器是一款面向大型音频素材库的 Windows 桌面检索工具。程序会为音频目录建立本地指纹索引，并从短片段、混剪、录屏提取音频或重编码样本中定位原始文件与时间偏移。

仓库：<https://github.com/Cyrene2008/AudioSeeker>

## 主要功能

- 为大型 WAV 音频目录建立本地指纹索引。
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

## 系统要求

- Windows 10 或 Windows 11，64 位。
- 首次启动需要网络连接，用于准备 Python 运行时、Python 依赖和 FFmpeg。
- 建议使用 SSD 存放大型索引。
- 构建和加载大型索引需要足够的磁盘空间与内存。

程序采用当前用户安装模式，不要求管理员权限。默认索引目录位于软件安装目录下的 `index` 文件夹；设置、收藏、历史和注册信息位于当前用户的应用数据目录。

## 安装

1. 从 [GitHub Releases](https://github.com/Cyrene2008/AudioSeeker/releases) 下载最新的 Windows 安装包。
2. 运行 `AudioSeeker_<版本>_x64-setup.exe`。
3. 首次启动时等待运行环境准备完成。
4. 进入“构建索引”页面选择音频目录并创建第一个索引。

首次启动会自动完成以下工作：

1. 在软件安装目录准备独立 Python 运行时。
2. 安装后端所需 Python 依赖。
3. 检查系统 FFmpeg；缺失时下载到软件安装目录。
4. 启动仅监听本机回环地址的后端服务。

如果准备时间较长，可以跳过等待进入界面。后端会继续在后台启动，在就绪前相关功能会显示连接状态。

## 快速使用

### 1. 构建索引

1. 打开“构建索引”。
2. 选择包含 WAV 文件的音频目录。
3. 输入索引名称。
4. 设置线程数。
5. 设置目标段加载内存，单位为 MB。
6. 根据目录结构决定是否启用递归扫描。
7. 开始构建并等待任务完成。

目标段加载内存表示每个索引段预计加载到内存时的目标大小，并不是严格的 SQLite 文件大小上限。`0` 表示不主动分段。单个大型文件不会被拆开，因此实际内存占用可能高于目标值。

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
- 导出所选：按样本时间线拼接选中的匹配结果。

## 索引缓存与内存

后端默认缓存最近加载的索引分段，以便连续检索同一索引时避免重复加载。缓存使用 LRU 策略，并限制同时保留的分段数量。

内存较小的设备可以在“设置”中启用“检索后卸载索引”。开启后每次检索结束都会释放本次使用的索引分段；下一次检索同一索引时需要重新加载，因此首次响应会更慢。

## 数据与目录

| 内容 | 默认位置 |
| --- | --- |
| 应用程序、Python、FFmpeg | 软件安装目录 |
| 新建索引 | `<软件安装目录>\index` |
| 设置、收藏、历史、索引注册信息 | 当前用户应用数据目录 |
| 临时音频和构建进度 | 应用数据目录下的临时目录 |

用户可以在设置中修改默认索引保存位置。修改不会移动或影响已经建立、注册或导入的索引。

## 支持的音频

- 索引构建当前扫描 WAV 文件。
- 样本选择支持 WAV、MP3、FLAC、OGG、M4A 和 WMA。
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
npm install
npm run sync:backend
npm run tauri dev
```

### 验证

```powershell
npm run build
python -m py_compile backend/server.py backend/build_index.py
cargo check --manifest-path src-tauri/Cargo.toml
```

### 打包

```powershell
npm run build:app
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
