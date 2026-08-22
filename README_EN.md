# Cyrene's Audio Seeker

**English** | [简体中文](README.md)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4.svg)](#requirements)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB.svg)](https://tauri.app/)
[![Vue](https://img.shields.io/badge/Vue-3-42B883.svg)](https://vuejs.org/)

Cyrene's Audio Seeker is a Windows desktop search tool for large audio libraries. It builds local fingerprint indexes and locates original files and offsets from short clips, long mixes, extracted recordings, or re-encoded samples.

> [!CAUTION]
> Made with ❤️ by [Cyrene2008](https://github.com/Cyrene2008)
> 
> Powered by [Vue Fluent Widgets](https://fluent.cyrene.hk)

## Features

- Build local fingerprint indexes for large audio libraries (WAV, FLAC, MP3, OGG, OPUS, AAC, M4A, WMA, AIFF, and more).
- Locate source files and offsets from short or long samples.
- Restrict the sample range and tune hit/confidence thresholds.
- Merge results with identical filenames using the highest confidence.
- Segment indexes using an explicit target memory value in MB.
- Incrementally process audio files that are not already indexed.
- Keep searches running while navigating to another page.
- Keep recently used index segments in memory for faster repeated searches.
- Optionally unload an index after each search to reduce memory usage.
- Play the complete source file starting from the matched offset.
- Favorite, unfavorite, reveal, and stitch matching results.
- Browse search history, manage indexes, switch languages, and check updates.

## Screenshots

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/f994206b-bd52-45e7-8123-a4b80831575e" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/a955f98b-c042-489b-bc87-feb2f756dc19" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/dce1c101-1239-4910-b4c7-72f11e73cad6" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/87c4c1cb-27fa-4289-8d49-06dd2bb2e0d7" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/dcc2abb5-1694-44cd-9b83-481408b01ef3" />

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/89ce4576-9fb3-47ae-aa11-07de157662d8" />

## Requirements

- 64-bit Windows 10 or Windows 11.
- No internet needed: Python, dependencies, and FFmpeg are removed or bundled with the installer. Install and use offline.
- SSD storage is recommended for large indexes.
- Sufficient disk space and memory for the target library.

The installer uses per-user mode and does not require administrator privileges. New indexes default to the `index` directory beside the installed application. Settings, favorites, history, and registry data remain in the current user's application-data directory.

## Installation

1. Download the latest Windows installer from [GitHub Releases](https://github.com/Cyrene2008/AudioSeeker/releases).
2. Run `AudioSeeker_<version>_x64-setup.exe` (installer language follows your OS language).
3. Launch straight into the main UI - no runtime preparation, no downloads.
4. Open Build Index and create your first index.

Since v26.1.0 the app is a single-process local engine: fingerprinting and
search are handled by a built-in Rust engine with a custom `.casi` binary
index format (mmap, zero-parse loading). No bootstrap downloads, no separate
backend process.

## Quick Start

### Build an index

1. Select an audio directory.
2. Enter an index name.
3. Choose the worker count.
4. Set target segment memory in MB.
5. Enable recursive scanning when subdirectories should be included.
6. Start the build and monitor progress and logs.

The MB value estimates the memory target for each loaded segment. It is not a strict index file-size limit. `0` disables active segmentation. A single large file is never split and may exceed the target.

### Incremental build

Select an existing index and source directory. The original segment-memory value is used as the default when metadata is available. Legacy or imported indexes without metadata use `0 MB` by default.

### Search

Select an index, choose a sample, optionally tune the range and thresholds, and start matching. Matching has no reliable numeric progress, so the UI displays an indeterminate progress ring. Navigation does not cancel the request; returning to Search restores its running or completed state.

### Result actions

- Play from the matched offset to the end of the source file.
- Click the star again to remove an existing favorite.
- Reveal the source file in Windows Explorer.
- Merge identical filenames using the highest-confidence occurrence.
- Export: copy the matched source files (full audio files) into the chosen folder.

## Index Cache

The backend keeps recently loaded segments in a bounded LRU cache. Repeated searches against the same segment avoid a costly reload.

Enable **Unload index after search** in Settings on memory-constrained systems. The next search against that index will need to load it again.

## Data Locations

| Data | Default location |
| --- | --- |
| Application, FFmpeg (bundled decoder) | Installed application directory |
| Newly built indexes | `<application directory>\index` |
| Settings, favorites, history, registry | Current user's application-data directory |
| Temporary audio and build progress | Temporary directory under application data |

Changing the default index location does not move existing or imported indexes.

## Audio Support

- Index building supports WAV, FLAC, MP3, OGG, OGA, OPUS, AAC, M4A, MP4, WMA, AIFF, and other common audio formats.
- Samples support the same format list as index building.
- Playback and conversion use FFmpeg.

## Architecture

- Vue 3 and Vite for the desktop UI.
- [VueFluentWidgets](https://fluent.cyrene.hk) for Fluent Design components.
- Tauri 2 and Rust for the window, native command IPC, and the single-process engine.
- Rust workspaces: casi-core (DSP/fingerprints), casi-index (`.casi` index), casi-search (voting matching), casi-server (optional HTTP/service form; the desktop client uses Tauri commands directly).
- `.casi` binary hash-table format with mmap mapping and 2^16 bucket directory.
- FFmpeg bundled as a sidecar (GPL build) for extra codec coverage.

## Development

```powershell
bun install
bun run sync:backend
bun run tauri dev
```

Validation:

```powershell
bun run build
python -m py_compile backend/server.py backend/build_index.py
cargo check --manifest-path src-tauri/Cargo.toml
```

Package the application:

```powershell
bun run build:app
```

The NSIS installer is generated under `src-tauri/target/release/bundle/nsis/`.

## Repository Layout

```text
backend/                  Python backend and fingerprint engine
src/                      Vue frontend
src/stores/               Shared state and cross-route caches
src/views/                Search, build, manage, favorites, settings, about
src-tauri/                Tauri/Rust desktop shell
scripts/                  Backend sync and installer rename scripts
docs/                     Project documentation
```

## Troubleshooting

### First launch takes a long time

Check access to Python, PyPI, and GitHub mirrors. You may enter the application while bootstrap continues.

### Manage Indexes takes time to show statistics

The cached registry is displayed first. File, hash, and disk statistics are refreshed in the background; counting very large SQLite indexes may take time on the first pass.

### The same index reloads on every search

Disable **Unload index after search**. Recently used segments will remain in the backend cache.

## License

Project source code is released under the [GNU General Public License v3.0](LICENSE). Distributed modifications must comply with GPLv3 source-availability and same-license requirements.

This program comes without warranty. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the complete notices. Third-party components and assets retain their own licenses:

- [VueFluentWidgets](https://fluent.cyrene.hk): MIT License, Copyright © 2025–2026 Cyrene2008.
- MiSans: subject to the MiSans font license.
- Python, Rust, and JavaScript dependencies: subject to their respective licenses.
- FFmpeg: license depends on the downloaded build and enabled features.

Copyright © 2025–2026 Cyrene2008
