# Technical Notes

## Architecture

```
┌──────────────────────────────┐
│  Vue 3 + VueFluentWidgets    │  Tauri 2 (Rust) desktop shell
│  Vite frontend               │
└──────────────┬───────────────┘
               │ HTTP (127.0.0.1 only)
┌──────────────▼───────────────┐
│  Python FastAPI backend      │  index / match / audio / export / favorites / settings
│  fp_core fingerprint core    │
│  build_index parallel build  │  SQLite shards + .dat binary
└──────────────┬───────────────┘
               │
     SQLite / NumPy / soundfile / librosa / ffmpeg
```

- Shell: Tauri 2 (Rust) for the window, installer, Python runtime bootstrap, and backend lifecycle.
- Backend: FastAPI + Python, listening only on the loopback address as a hidden child process.
- Frontend: Vue 3 + Vite with VueFluentWidgets Fluent Design components.
- Audio decoding: librosa/soundfile first; AAC, M4A, WMA and similar formats fall back to the bundled FFmpeg.

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

### SQLite Shards

Each segment directory (`seg_XXX` or the index root) contains `shard_*.sqlite` per worker:

- `files` table: `fid / name / path / duration / status`;
- `hashes` table: `h / fid / t`, indexed by `ix_h`.

`fid` is globally unique per shard.

### .dat Binary

Each shard has a compact `.dat` file storing `(hash, fid, t)` triplets (12 bytes each). Loading maps them directly into sorted NumPy arrays, avoiding SQLite re-parsing and drastically reducing load time for huge indexes.

### Segmentation and Metadata

- Files are greedily grouped by estimated hash count against the target segment memory (MB).
- `index_meta.json` at the index root records the original `segment_size_mb`, reused as the incremental default.
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

- `iter_library_files` collects audio by extension (common formats and mixed folders), optionally recursive.
- Workers decode, hash, and write shards in parallel with per-file progress events.
- Incremental builds read the indexed path set from existing shards and process only new files.
- On completion, total hashes are counted across all `hashes` tables.

## Export and Playback

- Export stitches the matched segments (`tq0/tq1`) along the sample timeline into a WAV file.
- `/api/audio` serves the full remainder of a file from an offset; the frontend player loads the complete file and seeks to the matched offset, so the progress bar shows the full duration.

## Repository Layout

```text
backend/
  fp_core.py        fingerprint core: hashing / loading / matching
  build_index.py    parallel build / resume / segmentation / incremental
  server.py         FastAPI: index / build / match / audio / export / favorites / settings
src/                Vue 3 frontend
  stores/           shared state and caches
  views/            search, build, manage, favorites, settings, about
src-tauri/          Tauri 2 (Rust): window / bootstrap / backend process
```

## Related Links

- [Getting Started](../guide/start)
- [Features](../guide/features)
- [GitHub Repository](https://github.com/Cyrene2008/AudioSeeker)
