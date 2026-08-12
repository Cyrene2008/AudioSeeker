# Cyrene's Audio Seeker

**English** | [简体中文](README.md)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4.svg)](#requirements)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB.svg)](https://tauri.app/)
[![Vue](https://img.shields.io/badge/Vue-3-42B883.svg)](https://vuejs.org/)

Cyrene's Audio Seeker is a Windows desktop search tool for large audio libraries. It builds local fingerprint indexes and locates original files and offsets from short clips, long mixes, extracted recordings, or re-encoded samples.

Repository: <https://github.com/Cyrene2008/AudioSeeker>

## Features

- Build local fingerprint indexes for large WAV libraries.
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

## Requirements

- 64-bit Windows 10 or Windows 11.
- An internet connection on first launch to prepare Python, dependencies, and FFmpeg.
- SSD storage is recommended for large indexes.
- Sufficient disk space and memory for the target library.

The installer uses per-user mode and does not require administrator privileges. New indexes default to the `index` directory beside the installed application. Settings, favorites, history, and registry data remain in the current user's application-data directory.

## Installation

1. Download the latest Windows installer from [GitHub Releases](https://github.com/Cyrene2008/AudioSeeker/releases).
2. Run `AudioSeeker_<version>_x64-setup.exe`.
3. Let the first-launch bootstrap prepare the runtime.
4. Open Build Index and create your first index.

The bootstrap prepares an isolated Python runtime, installs backend dependencies, downloads FFmpeg when needed, and starts a local-only backend service. You may enter the UI while a long bootstrap continues in the background.

## Quick Start

### Build an index

1. Select an audio directory.
2. Enter an index name.
3. Choose the worker count.
4. Set target segment memory in MB.
5. Enable recursive scanning when subdirectories should be included.
6. Start the build and monitor progress and logs.

The MB value estimates the memory target for each loaded segment. It is not a strict SQLite file-size limit. `0` disables active segmentation. A single large file is never split and may exceed the target.

### Incremental build

Select an existing index and source directory. The original segment-memory value is used as the default when metadata is available. Legacy or imported indexes without metadata use `0 MB` by default.

### Search

Select an index, choose a sample, optionally tune the range and thresholds, and start matching. Matching has no reliable numeric progress, so the UI displays an indeterminate progress ring. Navigation does not cancel the request; returning to Search restores its running or completed state.

### Result actions

- Play from the matched offset to the end of the source file.
- Click the star again to remove an existing favorite.
- Reveal the source file in Windows Explorer.
- Merge identical filenames using the highest-confidence occurrence.
- Stitch selected matches along the sample timeline.

## Index Cache

The backend keeps recently loaded segments in a bounded LRU cache. Repeated searches against the same segment avoid a costly reload.

Enable **Unload index after search** in Settings on memory-constrained systems. The next search against that index will need to load it again.

## Data Locations

| Data | Default location |
| --- | --- |
| Application, Python, FFmpeg | Installed application directory |
| Newly built indexes | `<application directory>\index` |
| Settings, favorites, history, registry | Current user's application-data directory |
| Temporary audio and build progress | Temporary directory under application data |

Changing the default index location does not move existing or imported indexes.

## Audio Support

- Index building currently scans WAV files.
- Samples may be WAV, MP3, FLAC, OGG, M4A, or WMA.
- Playback and conversion use FFmpeg.

## Architecture

- Vue 3 and Vite for the desktop UI.
- [VueFluentWidgets](https://fluent.cyrene.hk) for Fluent Design components.
- Tauri 2 and Rust for the window, installer, bootstrap, and backend lifecycle.
- FastAPI and Python for matching, audio streaming, export, favorites, and settings.
- SQLite and NumPy for fingerprint storage and in-memory matching.

## Development

```powershell
npm install
npm run sync:backend
npm run tauri dev
```

Validation:

```powershell
npm run build
python -m py_compile backend/server.py backend/build_index.py
cargo check --manifest-path src-tauri/Cargo.toml
```

Package the application:

```powershell
npm run build:app
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
