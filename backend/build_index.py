"""build_index.py - 并行构建音频指纹索引（SQLite 分片，断点续建）。

用法:
  python build_index.py <音频目录> --out <索引目录> [--workers N] [--limit N]
                        [--recursive] [--segment-size-mb N] [--incremental]
                        [--job <progress文件>]

--segment-size-mb N: 按目标加载内存对音频分段建库（每段约 N MB，0 为单段）。
--job: 服务模式，进度以 JSON 行写入指定文件（供前端进度条轮询）。
"""

import argparse
import hashlib
import json
import multiprocessing as mp
import os
import sys
import time

import numpy as np
import soundfile as sf

import fp_core
from fp_core import load_audio, extract_hashes, init_shard, iter_library_files

# 经验换算：每行哈希约 32B 内存（h+fid+t+排序索引各 8B）
BYTES_PER_HASH = 32.0
# 平均哈希速率（哈希/秒音频）
HASHES_PER_SEC_EST = 1000.0


def estimate_hashes(files):
    """用文件头快速估计每个文件的总哈希量（不完整解码）。"""
    out = []
    for f in files:
        try:
            dur = sf.info(f).duration
        except Exception:
            dur = 4.0
        out.append(int(dur * HASHES_PER_SEC_EST))
    return out


def split_segments(files, segment_size_mb):
    """按目标内存把文件列表分成若干段。

    每段预计占用 segment_size_mb MB 内存。返回 [seg_files, ...]。
    segment_size_mb<=0 时返回单段（全量）。
    """
    if segment_size_mb <= 0 or len(files) <= 1:
        return [files]
    budget = int(segment_size_mb * (1 << 20) / BYTES_PER_HASH)
    est = estimate_hashes(files)
    segments, cur, cur_est = [], [], 0
    for f, e in zip(files, est):
        if cur and cur_est + e > budget:
            segments.append(cur)
            cur, cur_est = [], 0
        cur.append(f)
        cur_est += e
    if cur:
        segments.append(cur)
    return segments


def process_files(shard_path, files, events=None):
    """处理一个分片的文件列表。events 为可选 mp.Queue：每文件发 (name, ok) 事件。"""
    stats = [0, 0, 0]  # ok, fail, skip
    con = None
    dat_f = None
    shard_id = int(os.path.basename(shard_path).split('_')[1].split('.')[0])
    dat_path = shard_path.replace('.sqlite', '.dat')
    try:
        con = sqlite3_connect(shard_path)
        if not os.path.exists(dat_path) or os.path.getsize(dat_path) == 0:
            dat_f = open(dat_path, 'wb')
        done = set(r[0] for r in con.execute('SELECT name FROM files WHERE status=1'))
        for f in files:
            name = os.path.basename(f)
            if name in done:
                stats[2] += 1
                if events is not None:
                    events.put((name, True))
                continue
            try:
                y = load_audio(f)
                hs = extract_hashes(y)
                dur = y.size / fp_core.SR
            except Exception as e:
                stats[1] += 1
                if events is not None:
                    events.put((name, False))
                print(f'  FAIL  {f}: {e!r}', flush=True)
                continue
            cur = con.execute(
                'INSERT INTO files(name,path,duration,status) VALUES(?,?,?,1)',
                (name, f, dur))
            fid = (shard_id << 24) | cur.lastrowid  # 全局唯一 fid
            con.execute('UPDATE files SET fid=? WHERE fid=?', (fid, cur.lastrowid))
            con.executemany('INSERT INTO hashes(h,fid,t) VALUES(?,?,?)',
                            ((int(h), fid, int(t)) for h, t in hs))
            if dat_f is not None and hs.size:
                packed = np.column_stack(
                    (hs[:, 0].astype('<i4'), np.full(hs.shape[0], fid, '<i4'),
                     hs[:, 1].astype('<i4')))
                dat_f.write(packed.tobytes())
            con.commit()
            stats[0] += 1
            if events is not None:
                events.put((name, True))
    finally:
        if dat_f is not None:
            dat_f.close()
        if con is not None:
            con.close()
    return shard_path, stats


def sqlite3_connect(path):
    import sqlite3
    con = sqlite3.connect(path)
    con.execute('PRAGMA journal_mode=WAL')
    con.execute('PRAGMA synchronous=OFF')
    con.execute('PRAGMA cache_size=-200000')
    return con


def worker_entry(args):
    shard_path, files, events = args
    return process_files(shard_path, files, events)


def build_one_segment(files, out_dir, workers, events, log):
    """构建一个段（out_dir 即段目录，含 shard_*.sqlite）。返回 (ok, fail, skip)。"""
    n_workers = workers or min(10, max(2, (os.cpu_count() or 4) - 2))
    os.makedirs(out_dir, exist_ok=True)
    shards = [os.path.join(out_dir, f'shard_{i}.sqlite') for i in range(n_workers)]
    for s in shards:
        init_shard(s)
    per_shard = [[] for _ in range(n_workers)]
    for f in files:
        idx = int(hashlib.md5(f.encode('utf-8', 'surrogatepass')).hexdigest(), 16) % n_workers
        per_shard[idx].append(f)
    tasks = [(shards[i], per_shard[i], events) for i in range(n_workers) if per_shard[i]]
    pool = mp.Pool(n_workers)
    ok = fail = skip = 0
    for shard_path, stats in pool.imap_unordered(worker_entry, tasks):
        ok += stats[0]
        fail += stats[1]
        skip += stats[2]
        con = sqlite3_connect(shard_path)
        con.execute('CREATE INDEX IF NOT EXISTS ix_h ON hashes(h)')
        con.execute('VACUUM')
        con.close()
    pool.close()
    pool.join()
    log(f'  段 {os.path.basename(out_dir)} 完成: 新增 {ok}, 失败 {fail}, 跳过 {skip}')
    return ok, fail, skip


def _event_drainer(events, progress_cb, total, stop):
    """后台线程：从队列取逐文件事件，更新进度回调。"""
    done = failed = skipped = 0
    last = ['']
    while not stop.is_set():
        try:
            name, ok = events.get(timeout=0.2)
        except Exception:
            continue
        if ok:
            done += 1
        else:
            failed += 1
        last[0] = name
        progress_cb(last[0], done + failed + skipped, total, done, failed, skipped)
    # 排空剩余
    while True:
        try:
            name, ok = events.get_nowait()
        except Exception:
            break
        if ok:
            done += 1
        else:
            failed += 1
        last[0] = name
    progress_cb(last[0], done + failed + skipped, total, done, failed, skipped)


def indexed_paths(out_dir):
    paths = set()
    for dirpath, _, fnames in os.walk(out_dir):
        for fn in fnames:
            if not fn.startswith('shard_') or not fn.endswith('.sqlite'):
                continue
            con = sqlite3_connect(os.path.join(dirpath, fn))
            paths.update(os.path.abspath(row[0]) for row in con.execute(
                'SELECT path FROM files WHERE status=1'))
            con.close()
    return paths


def next_segment_number(out_dir):
    numbers = []
    if os.path.isdir(out_dir):
        for name in os.listdir(out_dir):
            if name.startswith('seg_') and name[4:].isdigit():
                numbers.append(int(name[4:]))
    return max(numbers, default=-1) + 1


def write_metadata(out_dir, segment_size_mb):
    path = os.path.join(out_dir, 'index_meta.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'schema': 1, 'segment_size_mb': int(segment_size_mb)}, f,
                  ensure_ascii=False, indent=2)


def run_build(src_dir, out_dir, workers=0, recursive=False, segment_size_mb=0,
              incremental=False, progress_cb=None, log=print):
    """构建索引主入口（CLI 与服务模式共用）。

    progress_cb(name, processed, total, done, failed, skipped)
    返回 (ok, fail, skip, total_hashes)。
    """
    t0 = time.time()
    files = iter_library_files(src_dir, recursive=recursive)
    if incremental:
        existing = indexed_paths(out_dir)
        files = [f for f in files if os.path.abspath(f) not in existing]
    if not files:
        log('未找到 wav 文件')
        return 0, 0, 0, 0

    total = len(files)
    events = mp.Manager().Queue() if progress_cb else None
    stop = mp.Manager().Event() if progress_cb else None
    drainer = None
    if progress_cb:
        import threading
        drainer = threading.Thread(
            target=_event_drainer, args=(events, progress_cb, total, stop), daemon=True)
        drainer.start()

    ok = fail = skip = 0
    root_has_shards = os.path.isdir(out_dir) and any(
        name.startswith('shard_') and name.endswith('.sqlite')
        for name in os.listdir(out_dir))
    if incremental and root_has_shards:
        segments = [files]
        if segment_size_mb > 0:
            log('现有索引为单段结构，本次增量构建继续写入单段以保持兼容')
    else:
        segments = split_segments(files, segment_size_mb)
    log(f'共 {total} 个文件, 分为 {len(segments)} 段, 线程 {workers or "auto"}')
    segment_start = next_segment_number(out_dir) if incremental else 0
    for i, seg_files in enumerate(segments):
        use_segment_dirs = not root_has_shards and (segment_size_mb > 0 or any(
            name.startswith('seg_') for name in os.listdir(out_dir))
        )
        if use_segment_dirs:
            seg_dir = os.path.join(out_dir, f'seg_{segment_start + i:03d}')
            log(f'== 段 {i+1}/{len(segments)}: {len(seg_files)} 个文件')
        else:
            seg_dir = out_dir
        so, sf_, sk = build_one_segment(seg_files, seg_dir, workers, events, log)
        ok += so
        fail += sf_
        skip += sk

    if stop is not None:
        stop.set()
        drainer.join(timeout=5)

    total_hashes = 0
    for dirpath, _, fnames in os.walk(out_dir):
        for fn in fnames:
            if fn.startswith('shard_') and fn.endswith('.sqlite'):
                con = sqlite3_connect(os.path.join(dirpath, fn))
                total_hashes += con.execute('SELECT COUNT(*) FROM hashes').fetchone()[0]
                con.close()
    log(f'完成: {ok} 新增, {fail} 失败, {skip} 已存在, '
        f'共 {total_hashes:,} 条哈希, 耗时 {time.time()-t0:.1f}s')
    if not incremental:
        write_metadata(out_dir, segment_size_mb)
    return ok, fail, skip, total_hashes


def main():
    # 日志统一 UTF-8（避免 Windows GBK 控制台编码导致乱码）
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
    ap = argparse.ArgumentParser(description='构建音频指纹索引（可断点续建）')
    ap.add_argument('audio_dir')
    ap.add_argument('--out', default='index')
    ap.add_argument('--workers', type=int, default=0, help='并行进程数（默认 auto）')
    ap.add_argument('--limit', type=int, default=0, help='只处理前 N 个文件（调试用）')
    ap.add_argument('--recursive', action='store_true', help='递归扫描子目录')
    ap.add_argument('--segment-size-mb', type=int, default=0,
                    help='目标段加载内存(MB)，0 为单段')
    ap.add_argument('--incremental', action='store_true', help='仅处理尚未入索引的文件')
    ap.add_argument('--job', default=None, help='服务模式：进度写入此 JSONL 文件')
    args = ap.parse_args()

    def progress_cb(name, processed, total, done, failed, skipped):
        if args.job:
            with open(args.job, 'a', encoding='utf-8') as f:
                f.write(json.dumps(dict(
                    name=name, processed=processed, total=total,
                    done=done, failed=failed, skipped=skipped)) + '\n')
        else:
            print(f'  [{processed}/{total}] {name}', flush=True)

    mp.set_start_method('spawn', force=True)
    if args.limit:
        files = iter_library_files(args.audio_dir, recursive=args.recursive)[:args.limit]
        # 限制模式直接走 process_files
        os.makedirs(args.out, exist_ok=True)
        s = os.path.join(args.out, 'shard_0.sqlite')
        init_shard(s)
        process_files(s, files)
        print(f'限制模式完成: {len(files)} 个文件')
        return
    if args.job:
        files = iter_library_files(args.audio_dir, recursive=args.recursive)
        if args.incremental:
            existing = indexed_paths(args.out)
            files = [f for f in files if os.path.abspath(f) not in existing]
        with open(args.job, 'w', encoding='utf-8') as f:
            f.write(json.dumps(dict(started=True, total=len(files))) + '\n')
    run_build(args.audio_dir, args.out, workers=args.workers,
              recursive=args.recursive, segment_size_mb=args.segment_size_mb,
              incremental=args.incremental,
              progress_cb=progress_cb)


if __name__ == '__main__':
    main()
