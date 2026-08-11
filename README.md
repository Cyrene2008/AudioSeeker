# Cyreneの音频检索器 (CyreneAudioSeeker)

基于音频指纹的素材检索桌面应用：对游戏音频解包目录建立指纹索引，用任意长度的样本音频（短切片、长混剪、录屏提取、重编码 MP3）检索定位源文件与偏移，并支持把长样本中包含的所有相关音频按时间线拼接还原。

- 前端：Vue 3 + [vue-fluent-widgets](https://www.npmjs.com/package/vue-fluent-widgets)（桃粉 `.peach` 主题）+ Tauri 2
- 后端：Python（FastAPI），自包含运行时引导（自动下载/解压 Python、pip 依赖、ffmpeg，全程无命令行窗口）
- 指纹引擎：Shazam 风格频谱峰值对哈希，SQLite 分片存储，支持按内存分段建库

仓库：<https://github.com/Cyrene2008/CyreneAudioSeeker>

## 目录结构

```
├── backend/             # Python 后端
│   ├── fp_core.py       # 指纹核心（提取/索引/匹配/拼接导出）
│   ├── build_index.py   # 索引构建（并行/断点续建/按内存分段）
│   ├── match.py         # CLI 匹配工具
│   └── server.py        # FastAPI 服务（索引管理/构建任务/匹配/音频流/导出/收藏/设置）
├── src/                 # Vue 3 前端
│   ├── views/           # 检索/构建/管理/收藏/设置/关于
│   ├── components/      # TitleBar（汉堡菜单）/Dock/播放条/Toast
│   └── utils/           # i18n / API / 更新检查
├── src-tauri/           # Tauri 2（Rust 运行时引导 + 打包）
│   └── src/backend.rs   # Python 环境引导与后端进程管理
├── scripts/             # 构建脚本
└── docs/                # 技术文档
```

## 开发

```bash
npm install
npm run sync:backend     # 同步后端文件到 Tauri 资源目录
npm run tauri dev        # 启动开发（自动拉起后端）
```

生产打包：

```bash
npm run tauri build      # 产物：src-tauri/target/release/bundle/nsis/*.exe
```

## 运行时引导流程（首次启动）

1. 检测安装目录 `./env/python.exe`，不存在则下载 python-build-standalone 并解压（大陆走 gh-proxy 镜像）
2. 确保 pip（get-pip.py），`pip install -r requirements.txt`（大陆走清华 tuna 镜像）
3. 检查 ffmpeg（PATH 或 `./ffmpeg/bin/ffmpeg.exe`），缺失则下载 BtbN 构建
4. 以隐藏窗口方式启动 `backend/server.py`，轮询 `/api/health` 就绪后显示窗口

所有子进程均隐藏命令行窗口；退出应用时自动杀掉后端进程。

## 主要功能

- **开始检索**：选择已构建索引（支持分段索引选段）、样本文件（可切区间/调阈值），结果表按置信度排序；行内播放、收藏、资源管理器定位；多选收藏/拼接导出
- **构建索引**：新建（提示不会扫描子目录）、对已有索引增量构建；自定义线程数（默认 8）与目标段内存（0=单段）；实时进度条与日志，断点续传
- **管理索引**：查看/导入（仅建引导不复制）/删除索引（可同时删除文件夹释放空间）
- **收藏**：检索结果收藏；页面内播放（FluentMediaPlayer，跨页面持续）；导出文件到任意位置；取消收藏
- **设置**：深色模式、中英 i18n、修改默认索引保存位置（不影响已建索引）、检查更新
- **关于**：版本、GitHub 仓库跳转、更新检查（GitHub API + 代理回退）

## 技术要点

- 指纹：11025Hz 单声道 STFT，逐帧相对窗口 + 秩选峰（对音量/时间原点不变），30-bit 峰值对哈希
- 索引：SQLite 分片（全局 fid）+ `.dat` 二进制快速加载（全库 3.57 亿哈希载入 44s）
- 匹配：偏移对齐投票 + 簇聚类，阈值按样本时长自适应；1~5s 切片定位误差 ≤0.3s，长样本可一次找出所有内嵌文件
- 更新：指向 `github.com/Cyrene2008/CyreneAudioSeeker` 的 releases

## 许可

字体：MiSans（小米开源字体，遵循 [MiSans 字体许可](https://hyperos.mi.com/font/download)）。组件库：[vue-fluent-widgets](https://www.npmjs.com/package/vue-fluent-widgets)。
