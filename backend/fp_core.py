"""fp_core.py - 音频指纹核心：指纹提取 / 分片索引加载 / 多段聚类匹配。

算法：Shazam 风格频谱局部峰值 + 峰值对哈希 (f1, f2, dt)。
匹配时对每个候选文件做"时间偏移对齐投票"，投票数最高的偏移簇即命中，
同一文件在不同时间多次出现会被聚成多个独立命中（支持混剪/拼接场景）。
"""

import os
import sqlite3
from collections import defaultdict

import numpy as np
import librosa
from scipy.ndimage import maximum_filter

# ---------- 指纹参数 ----------
SR = 11025                # 指纹采样率 (mono)
N_FFT = 1024
HOP = 256
F_BINS = 511              # 使用的频率 bin 数 (0..510) -> 频点 1..511
PEAK_MIN_DB = -65.0       # 绝对阈值下限（相对文件峰值；低于此的音量基本不可闻）
PEAK_WINDOW_DB = 12.0     # 逐帧相对窗口：保留帧内峰值 12dB 内的局部极大值
PEAK_PER_FRAME = 3        # 每帧最多保留的峰数（逐帧选择与时间原点无关）
PAIR_WINDOW = 25          # 每个锚点峰值向后配对的数量
MAX_DT = 4095             # 最大时间差 (帧)
DT_BITS = 12
F2_SHIFT = DT_BITS
F1_SHIFT = F2_SHIFT + 9   # 频点各占 9 bit (1..511)
HASH_BITS = F1_SHIFT + 9
FRAME_SEC = HOP / SR      # 每帧时长

DEFAULT_MIN_ALIGNED = 8   # 单个命中簇最少对齐哈希数
DEFAULT_MIN_RATIO = 0.02  # 短样本(<=15s)的对齐占比; 长样本按时长自适应下调
HASHES_PER_SEC = 900.0    # 经验平均哈希速率, 用于估计样本时长


# ---------- 指纹提取 ----------

def load_audio(path):
    y, _ = librosa.load(path, sr=SR, mono=True, res_type='soxr_hq')
    if y.size == 0:
        raise ValueError('empty audio')
    return y


def spectrogram_db(y):
    S = np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=HOP))
    M = librosa.amplitude_to_db(S, ref=np.max)
    return M[:F_BINS, :]


def extract_hashes(y):
    """返回 (n,2) int64 数组，每行 [hash, 锚点帧号]

    峰选取法：2D 局部极大值(5x5) + 逐帧相对窗口（帧内峰值 12dB 内，
    绝对下限 PEAK_MIN_DB）+ 每帧按幅度保留 top-PEAK_PER_FRAME。
    逐帧秩选择保证切片与全文件的峰集合一致（对整体音量差异与
    切片时间原点均不敏感），静音帧自动被 PEAK_MIN_DB 排除。
    """
    M = spectrogram_db(y)
    maxf = maximum_filter(M, size=(5, 5), mode='constant', cval=-200.0)
    lm = M == maxf
    frame_max = M.max(axis=0)
    window = np.maximum(frame_max - PEAK_WINDOW_DB, PEAK_MIN_DB)
    mask = lm & (M >= window[None, :])
    ys, xs = np.nonzero(mask)
    if ys.size == 0:
        return np.empty((0, 2), dtype=np.int64)
    # 每帧按幅度保留 top-PEAK_PER_FRAME（逐帧秩选择：对整体音量与切片时间原点均不变）
    vals = M[ys, xs]
    order = np.lexsort((-vals, xs))
    ys, xs = ys[order], xs[order]
    keep = []
    cur_frame = None
    cnt = 0
    for k in range(ys.size):
        if xs[k] != cur_frame:
            cur_frame = xs[k]
            cnt = 0
        if cnt < PEAK_PER_FRAME:
            keep.append(k)
            cnt += 1
    keep = np.array(keep, dtype=np.int64)
    ys, xs = ys[keep], xs[keep]
    n = xs.size
    rows = []
    append = rows.append
    for i in range(n):
        fi = int(ys[i]) + 1
        xi = int(xs[i])
        end = min(n, i + PAIR_WINDOW + 1)
        for j in range(i + 1, end):
            dt = int(xs[j]) - xi
            if dt < 2 or dt > MAX_DT:
                continue
            fj = int(ys[j]) + 1
            append(((fi << F1_SHIFT) | (fj << F2_SHIFT) | dt, xi))
    return np.array(rows, dtype=np.int64)


# ---------- 索引分片 ----------

SCHEMA = """
CREATE TABLE IF NOT EXISTS files(
  fid INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  duration REAL NOT NULL,
  status INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS hashes(
  h INTEGER NOT NULL,
  fid INTEGER NOT NULL,
  t INTEGER NOT NULL);
"""


def init_shard(path):
    con = sqlite3.connect(path)
    con.executescript(SCHEMA)
    con.commit()
    con.close()


def iter_library_files(root, recursive=True):
    """收集 wav 文件，返回绝对路径列表（排序保证稳定）。

    recursive=False 时只扫描根目录一层（不进入子目录）。
    """
    root = os.path.abspath(root)
    out = []
    for dirpath, dirs, fnames in os.walk(root):
        if not recursive:
            dirs.clear()
        for fn in sorted(fnames):
            if fn.lower().endswith('.wav'):
                out.append(os.path.join(dirpath, fn))
    out.sort()
    return out


def list_index_segments(index_dir):
    """探测索引目录的分段结构。

    返回 (段列表, 段名列表)：index_dir 本身含 shard_*.sqlite 则视为单段；
    否则扫描其下的 seg_* 子目录。每段是一个完整的索引目录（含分片）。
    """
    if os.path.isdir(index_dir) and any(
            f.startswith('shard_') and f.endswith('.sqlite')
            for f in os.listdir(index_dir)):
        return [index_dir], [os.path.basename(index_dir) or 'index']
    segments = []
    names = []
    if os.path.isdir(index_dir):
        for d in sorted(os.listdir(index_dir)):
            p = os.path.join(index_dir, d)
            if os.path.isdir(p) and any(
                    f.startswith('shard_') and f.endswith('.sqlite')
                    for f in os.listdir(p)):
                segments.append(p)
                names.append(d)
    return segments, names


class ShardIndex:
    """只读内存索引。匹配前把某个分片整个载入内存（排序后二分查找）。"""

    def __init__(self, path):
        self.path = path
        self.files = []
        self._h = None
        self._fid = None
        self._t = None
        self._order = None

    def load(self):
        con = sqlite3.connect(f'file:{self.path}?mode=ro', uri=True)
        self.files = con.execute(
            'SELECT fid, name, path, duration FROM files').fetchall()
        dat_path = self.path.replace('.sqlite', '.dat')
        if os.path.exists(dat_path) and os.path.getsize(dat_path) > 0:
            # 紧凑二进制预载（秒级）
            arr = np.fromfile(dat_path, dtype=np.dtype([
                ('h', '<i4'), ('fid', '<i4'), ('t', '<i4')]))
            self._h = arr['h'].astype(np.int64)
            self._fid = arr['fid'].astype(np.int64)
            self._t = arr['t'].astype(np.int64)
        else:
            cnt = con.execute('SELECT COUNT(*) FROM hashes').fetchone()[0]
            h_arr = np.empty(cnt, dtype=np.int64)
            fid_arr = np.empty(cnt, dtype=np.int64)
            t_arr = np.empty(cnt, dtype=np.int64)
            i = 0
            for h, fid, t in con.execute('SELECT h, fid, t FROM hashes'):
                h_arr[i] = h
                fid_arr[i] = fid
                t_arr[i] = t
                i += 1
            self._h = h_arr
            self._fid = fid_arr
            self._t = t_arr
        con.close()
        self._order = np.argsort(self._h, kind='stable')

    def lookup(self, h):
        """返回 (fid_arr, t_arr) 切片视图"""
        if self._h is None:
            self.load()
        lo = np.searchsorted(self._h, h, sorter=self._order)
        hi = np.searchsorted(self._h, h + 1, sorter=self._order)
        if lo == hi:
            return None
        idx = self._order[lo:hi]
        return self._fid[idx], self._t[idx]

    def file_info(self, fid):
        for row in self.files:
            if row[0] == fid:
                return row
        return None


# ---------- 匹配 ----------

def match_index(indexes, query_hashes, min_aligned=DEFAULT_MIN_ALIGNED,
                min_ratio=None, delta_tol=2):
    """query_hashes: (n,2) [hash, t_frame]

    min_ratio=None 时按样本时长自适应: 短切片用高比例(去噪),
    长样本用低比例(不放过其中较短的内嵌片段)。

    返回 occurrences: list of dict:
      file_id, name, path, file_duration,
      aligned, ratio, tq0, tq1 (样本帧), offset_file (文件内偏移秒),
      span (秒)
    """
    if min_ratio is None:
        dur_est = len(query_hashes) / HASHES_PER_SEC
        min_ratio = max(0.001, min(0.008, 3.0 / max(dur_est, 0.5)))
    uniq = defaultdict(list)
    for h, tq in query_hashes:
        uniq[int(h)].append(int(tq))

    acc = defaultdict(lambda: [0, 1 << 60, -(1 << 60)])  # (fid,delta)->[cnt,min_tq,max_tq]
    for idx in indexes:
        for h, tqs in uniq.items():
            res = idx.lookup(h)
            if res is None:
                continue
            fs, ts = res
            if fs.size == 1:
                # 快速路径：单行命中
                fid = int(fs[0])
                tf = int(ts[0])
                for tq in tqs:
                    key = (fid, tf - tq)
                    b = acc[key]
                    b[0] += 1
                    if tq < b[1]:
                        b[1] = tq
                    if tq > b[2]:
                        b[2] = tq
                continue
            for tq in tqs:
                d = ts - tq
                ud, ui, uc = np.unique(d, return_index=True, return_counts=True)
                for dd, fi, cc in zip(ud.tolist(), ui.tolist(), uc.tolist()):
                    key = (int(fs[fi]), dd)
                    b = acc[key]
                    b[0] += int(cc)
                    if tq < b[1]:
                        b[1] = tq
                    if tq > b[2]:
                        b[2] = tq

    by_fid = defaultdict(list)
    for (fid, d), (cnt, tq0, tq1) in acc.items():
        by_fid[fid].append([d, cnt, tq0, tq1])

    total = len(query_hashes)
    floor = max(min_aligned, int(np.ceil(total * min_ratio)))
    occurrences = []
    for fid, items in by_fid.items():
        items.sort(key=lambda r: r[0])
        clusters = []
        for d, cnt, tq0, tq1 in items:
            if clusters and abs(d - clusters[-1][0]) <= delta_tol:
                cur = clusters[-1]  # [最强delta, 总计数, 最强桶计数, min_tq, max_tq]
                if cnt > cur[2]:
                    cur[0], cur[2] = d, cnt  # 最强桶决定偏移
                cur[1] += cnt
                cur[3] = min(cur[3], tq0)
                cur[4] = max(cur[4], tq1)
            else:
                clusters.append([d, cnt, cnt, tq0, tq1])
        for d, cnt, _cnt, tq0, tq1 in clusters:
            if cnt < floor:
                continue
            offset = d * FRAME_SEC  # delta: 样本起点(t_q=0)对应的文件时刻
            occurrences.append(dict(
                file_id=fid, aligned=cnt, ratio=cnt / total,
                tq0=tq0, tq1=tq1,
                offset_file=round(offset, 3),
                span=round((tq1 - tq0) * FRAME_SEC, 3),
            ))
    occurrences.sort(key=lambda r: -r['aligned'])
    return occurrences


# ---------- 索引加载与拼接导出 ----------

def load_indexes(index_dir):
    """加载 index_dir 下所有分片并缓存，返回 (ShardIndex 列表, 文件信息表)"""
    shards = sorted(
        os.path.join(index_dir, f) for f in os.listdir(index_dir)
        if f.startswith('shard_') and f.endswith('.sqlite'))
    indexes = [ShardIndex(s) for s in shards]
    for idx in indexes:
        idx.load()
    return indexes


EXPORT_SR = 48000


def export_stitch(occurrences, out_path, guard=0.2):
    """按样本时间线顺序，从库文件提取各命中片段并拼接导出为一个 wav。

    guard: 每段前后额外保留秒数（用于覆盖边界/淡入淡出余量）。
    返回拼接总时长（秒）。
    """
    import soundfile as sf
    segs = []
    for occ in sorted(occurrences, key=lambda r: r['tq0']):
        path = occ['path']
        off = occ['offset_file']
        span = occ['span']
        info = sf.info(path)
        src_sr = info.samplerate
        start = max(0.0, off - guard)
        end = min(info.duration, off + span + guard)
        y, _ = librosa.load(path, sr=EXPORT_SR, mono=False,
                            offset=start, duration=end - start,
                            res_type='soxr_hq')
        segs.append((start, y))
    total = 0.0
    for start, y in segs:
        end = start + y.shape[-1] / EXPORT_SR
        total = max(total, end)
    if segs:
        out = np.concatenate([s[1] for s in segs], axis=-1)
        sf.write(out_path, out.T if out.ndim > 1 else out, EXPORT_SR)
    return total
