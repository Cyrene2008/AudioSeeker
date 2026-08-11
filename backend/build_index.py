"""build_index.py - 并行构建指纹索引（SQLite 分片，支持断点续建）。

用法:
  python build_index.py <音频目录> --out <索引目录> [--workers N] [--limit N]
"""

import argparse
import hashlib
import multiprocessing as mp
import os
import sys
import time

import numpy as np

import fp_core
from fp_core import load_audio, extract_hashes, init_shard


def process_files(shard_path, files, lock=None):
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
                continue
            try:
                y = load_audio(f)
                hs = extract_hashes(y)
                dur = y.size / fp_core.SR
            except Exception as e:
                stats[1] += 1
                if lock is not None:
                    with lock:
                        print(f'  FAIL  {f}: {e!r}', flush=True)
                else:
                    print(f'  FAIL  {f}: {e!r}', flush=True)
                continue
            cur = con.execute(
                'INSERT INTO files(name,path,duration,status) VALUES(?,?,?,1)',
                (name, f, dur))
            fid = (shard_id << 24) | cur.lastrowid  # 全局唯一 fid
            con.execute('UPDATE files SET fid=? WHERE fid=?',
                        (fid, cur.lastrowid))
            con.executemany('INSERT INTO hashes(h,fid,t) VALUES(?,?,?)',
                            ((int(h), fid, int(t)) for h, t in hs))
            if dat_f is not None and hs.size:
                packed = np.column_stack(
                    (hs[:, 0].astype('<i4'), np.full(hs.shape[0], fid, '<i4'),
                     hs[:, 1].astype('<i4')))
                dat_f.write(packed.tobytes())
            con.commit()
            stats[0] += 1
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
    shard_path, files, lock = args
    return process_files(shard_path, files, lock)


def main():
    ap = argparse.ArgumentParser(description='构建音频指纹索引（可断点续建）')
    ap.add_argument('audio_dir', help='包含 wav 的目录（递归）')
    ap.add_argument('--out', default='index', help='索引输出目录')
    ap.add_argument('--workers', type=int, default=0,
                    help='并行进程数（默认 min(10, cpu-2)）')
    ap.add_argument('--limit', type=int, default=0, help='只处理前 N 个文件（调试用）')
    ap.add_argument('--reindex', action='store_true', help='忽略已有状态强制重做')
    args = ap.parse_args()

    files = fp_core.iter_library_files(args.audio_dir)
    if args.limit:
        files = files[:args.limit]
    if not files:
        print('未找到 wav 文件')
        sys.exit(1)

    n_workers = args.workers or min(10, max(2, (os.cpu_count() or 4) - 2))
    os.makedirs(args.out, exist_ok=True)
    shards = [os.path.join(args.out, f'shard_{i}.sqlite') for i in range(n_workers)]
    for s in shards:
        init_shard(s)

    per_shard = [[] for _ in range(n_workers)]
    for f in files:
        idx = int(hashlib.md5(f.encode('utf-8', 'surrogatepass')).hexdigest(), 16) % n_workers
        per_shard[idx].append(f)

    t0 = time.time()
    mp.set_start_method('spawn', force=True)
    manager = mp.Manager() if n_workers > 1 else None
    lock = manager.Lock() if manager is not None else None
    pool = mp.Pool(n_workers)
    tasks = [(shards[i], per_shard[i], lock) for i in range(n_workers)
             if per_shard[i]]
    ok = fail = skip = 0
    done_files = set()
    for shard_path, stats in pool.imap_unordered(worker_entry, tasks):
        ok += stats[0]
        fail += stats[1]
        skip += stats[2]
        con = sqlite3_connect(shard_path)
        con.execute('CREATE INDEX IF NOT EXISTS ix_h ON hashes(h)')
        con.execute('VACUUM')
        con.close()
        print(f'  [{os.path.basename(shard_path)}] 完成, 累计 '
              f'新增 {ok} 失败 {fail} 跳过 {skip}', flush=True)
    pool.close()
    pool.join()

    total_hashes = 0
    for s in shards:
        con = sqlite3_connect(s)
        total_hashes += con.execute('SELECT COUNT(*) FROM hashes').fetchone()[0]
        con.close()
    print(f'完成: {ok} 个文件新增, {fail} 个失败, {skip} 个已存在, '
          f'共 {total_hashes:,} 条哈希, 耗时 {time.time()-t0:.1f}s')


if __name__ == '__main__':
    main()
