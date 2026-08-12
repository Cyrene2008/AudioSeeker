# Getting Started

## System Requirements

- 64-bit Windows 10 or Windows 11.
- An internet connection on first launch to prepare Python, dependencies, and FFmpeg.
- SSD storage is recommended for large indexes.
- Sufficient disk space and memory for the target library.

The installer uses per-user mode and does not require administrator privileges. New indexes default to the `index` directory beside the installed application. Settings, favorites, history, and registry data remain in the current user's application-data directory.

## Installation

1. Download the latest Windows installer from [GitHub Releases](https://github.com/Cyrene2008/AudioSeeker/releases).
2. Run `AudioSeeker_<version>_x64-setup.exe`.
3. On first launch the app prepares an isolated Python runtime, installs backend dependencies, downloads FFmpeg when needed, and starts a local-only backend service.
4. You may enter the UI while a long bootstrap continues in the background.

## Build an Index

1. Open **Build Index** and switch to **New Index**.
2. Select a folder containing audio. WAV, FLAC, MP3, OGG, OGA, OPUS, AAC, M4A, MP4, WMA, AIFF, and AIF are supported, including mixed folders.
3. Enter an index name.
4. Set the worker count (default 8, max 64).
5. Set the target segment memory in MB:
   - Each loaded segment aims to stay near this size; `0` keeps a single segment.
   - A single large file is never split and may exceed the target.
   - Larger values mean fewer segments and faster per-search loading, at the cost of memory.
6. Enable recursive scanning only when subdirectories should be included.
7. Start the build and watch progress and logs. Builds support resume: already-processed files are skipped when a task restarts.

## Incremental Build

1. Switch to **Incremental Build**.
2. Select an existing index and the source folder.
3. The original segment-memory value (MB) is used as the default when metadata exists; legacy or imported indexes fall back to `0 MB`.
4. Only audio files that are not yet in the index are processed.

## Search

1. Open **Search**, choose an index or segment.
2. Choose a sample (same format list as index building).
3. Optionally trim the sample range and tune thresholds (minimum aligned hashes, minimum confidence).
4. Start matching. Progress is indeterminate, so the UI shows a progress ring.
5. Searches continue across page navigation; returning to Search restores the running or completed state.

## Result Actions

| Action | Description |
| --- | --- |
| Play | Plays the complete source file starting from the matched offset, across pages |
| Favorite | Click the star to favorite; click again to unfavorite |
| Reveal | Locates the source file in Windows Explorer |
| Merge same filenames | Merges identical filenames into one row using the highest confidence |
| Export selected | Stitches selected matches along the sample timeline into WAV |
| Export all | Stitches all matching results |

## Search History

Completed searches are saved automatically. History entries can be reloaded for review or re-export.

## Settings

- **Dark mode**: switch between light and dark appearance.
- **Language**: Chinese / English UI.
- **Default index location**: changes where new indexes are built; existing or imported indexes are unaffected.
- **Unload index after search**: frees the used segment after each search to save memory; the next search loads it again.
- **Check for updates**: prefers the gh-proxy mirror with the official GitHub API as fallback.
- **Open backend data folder**: opens the directory containing settings, favorites, history, and registry data.

## Data Locations

| Data | Default location |
| --- | --- |
| Application, Python, FFmpeg | Installed application directory |
| Newly built indexes | `<application directory>\index` |
| Settings, favorites, history, registry | Current user's application-data directory |

## Troubleshooting

### First launch takes a long time

Check access to Python, PyPI, and GitHub mirrors. You may enter the application while bootstrap continues.

### Manage Indexes takes time to show statistics

The cached registry is shown first. File, hash, and disk statistics refresh in the background; counting very large SQLite indexes may take time on the first pass.

### The same index reloads on every search

Disable **Unload index after search**. Recently used segments remain in the backend cache.

## Related Links

- [Features](../guide/features)
- [Technical Notes](../guide/technical)
- [GitHub Repository](https://github.com/Cyrene2008/AudioSeeker)
