# Technical Notes

## Architecture

```
┌──────────────────────────────┐
│  Vue 3 + VueFluentWidgets    │  Tauri 2 (Rust) desktop shell
│  Vite frontend               │
└──────────────┬───────────────┘
               │ Native command IPC (no HTTP port)
┌──────────────▼───────────────┐
│  Rust engine (casi crates)   │  index / match / export / favorites / settings
│  casi-core fingerprint core  │
│  casi-index parallel build   │  .casi binary index (mmap zero-parse)
└──────────────┬───────────────┘
               │
     Rust FFT / custom peak picking / bundled FFmpeg (sidecar)
```

- Shell: Tauri 2 (Rust), single process: window + native command IPC + local engine.
- Engine: Rust workspace (casi-core / casi-index / casi-search) accessed via Tauri commands; `casi-server` provides an optional HTTP/service form.
- Frontend: Vue 3 + Vite with VueFluentWidgets Fluent Design components.
- Audio decoding: WAV read directly; FLAC/MP3/AAC/M4A/WMA fall back to the bundled FFmpeg (GPL sidecar).

## Fingerprint Algorithm

### Preprocessing

- Audio is resampled to **11025 Hz mono**.
- STFT with a 1024 window and 256 hop (about 23 ms per frame), using 511 frequency bins.

### Peak Selection

Two-step peak extraction over the dB magnitude spectrum:

1. **2D local maxima** within a 5×5 neighborhood.
2. **Per-frame rank selection**: keep peaks within 12 dB of the frame peak and above a -65 dB floor, at most 3 per frame.

Rank selection keeps the peak set invariant to overall volume and time origin, which is why short samples reliably match full files.

### Peak-Pair Hashing

Each anchor peak is paired with the next 25 peaks as `(f1, f2, dt)`:

- `f1`, `f2`: frequency bins (9 bits each);
- `dt`: frame time difference (12 bits, max 4095).

The pair is combined into a 30-bit hash value, producing a hash sequence per audio segment.

## Index Structure

### `.casi` Binary Index (v26.1.0+)

A single `.casi` file contains:

- 128-byte header (magic `CASI` / version / section offsets);
- a 2^16 bucket directory (top 16 bits of the 30-bit hash) plus posting arrays ordered by `(hash, frame)` (12 bytes per row: `h/fid/t`);
- a file metadata table and string pool.

`fid` is globally unique (legacy conversion keeps `(shard<<24)|rowid`).

Loading is zero-parse: the file is `mmap`ped; lookups use the bucket directory plus binary search inside a bucket. Cold start does not touch unused pages - huge indexes open in milliseconds.

### Segmentation and Metadata

- Files are greedily grouped by estimated hash count against the target segment memory (MB).
- `index_meta.json` at the index root records the original `segment_size_mb`; `index.json` records version and the file manifest (used by incremental builds).
- Legacy or imported indexes without metadata are treated as `0 MB` (single segment).

### In-Memory Cache

- The backend keeps a segment-level LRU cache (default up to 4 segments).
- Matching against loaded shards is read-only and concurrent; loading is serialized to avoid duplicate allocation spikes.
- With **Unload index after search** enabled, the used segment is released after each match, guarded by instance checks against concurrent requests.

## Matching Flow

1. Resolve the segment directory and load shards from cache.
2. Extract sample hashes (with optional time-range trimming).
3. For each candidate file, run **offset alignment voting**: the offset with the most matched hashes wins.
4. Multiple occurrences of the same file are clustered into separate hits (mixes and mashups).
5. Confidence = aligned hashes / sample hashes, capped at 100%; thresholds adapt to sample duration.

## Build Flow

- Audio files are collected by extension (common formats and mixed folders), optionally recursive.
- Workers decode, hash, and stream postings into the chunked external-sort builder with per-file progress events.
- Incremental builds read the indexed path set from `index.json` and process only new files.
- On completion, the total hash count comes from the `.casi` header.

## Export and Playback

- Export copies the matched source files (full audio) into the chosen folder; no segment stitching anymore.
- Playback loads the complete source file via the Tauri asset protocol (`convertFileSrc`) and seeks to the matched offset, so the progress bar shows the full duration.

## Repository Layout

```text
crates/               Rust workspace
  casi-core          fingerprint core: DSP / peak picking / hashing / decoding
  casi-index         .casi format: mmap / bucket directory / external-sort builder
  casi-search        matching and clustering (time-offset voting)
  casi-server        service form (axum) + pure-function logic layer (api.rs)
src/                Vue 3 frontend
  stores/           shared state and caches
  views/            search, build, manage, favorites, settings, about
src-tauri/          Tauri 2 (Rust): window / native command IPC / commands.rs
```

## Related Links

- [Getting Started](../guide/start)
- [Features](../guide/features)
- [GitHub Repository](https://github.com/Cyrene2008/AudioSeeker)
