"""server.py - AudioSeeker 后端服务 (FastAPI)。

由 Tauri 前端启动（Rust 侧负责 Python 运行时引导），监听 127.0.0.1:CYRENE_PORT(默认8765)。
提供：索引管理 / 构建任务 / 匹配 / 音频流(带Range) / 拼接导出 / 收藏 / 设置。
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

import fp_core
from fp_core import (load_audio, extract_hashes, load_indexes, match_index,
                     export_stitch, list_index_segments, iter_library_files)

APP_VERSION = '26.0.0'
APP_DIR = os.environ.get('CYRENE_APP_DIR', os.getcwd())
DATA_DIR = os.environ.get('CYRENE_DATA_DIR', os.path.join(
    tempfile.gettempdir(), 'cyrene-audio-seeker'))
os.makedirs(DATA_DIR, exist_ok=True)

SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
REGISTRY_FILE = os.path.join(DATA_DIR, 'indexes.json')
FAVORITES_FILE = os.path.join(DATA_DIR, 'favorites.json')
HISTORY_FILE = os.path.join(DATA_DIR, 'history.json')
HISTORY_DIR = os.path.join(DATA_DIR, 'history')
HISTORY_MAX = 50  # 最多保留的检索历史条数
TMP_DIR = os.path.join(DATA_DIR, 'tmp')
os.makedirs(TMP_DIR, exist_ok=True)

app = FastAPI(title='AudioSeeker Backend', version=APP_VERSION)
app.add_middleware(
    CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

# ---------- 持久化 ----------


def _load_json(path, default):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


def _save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_settings():
    s = _load_json(SETTINGS_FILE, {})
    if s.get('schema', 1) < 2:
        # v26 起默认浅色：清掉旧版残留的深色/主题设置
        s.pop('dark', None)
        s.pop('theme', None)
        s['schema'] = 2
        save_settings(s)
    s.setdefault('default_index_dir', os.path.join(APP_DIR, 'index'))
    s.setdefault('lang', 'zh')
    s.setdefault('dark', False)
    s.setdefault('theme', 'peach')
    s.setdefault('unload_index_after_search', False)
    return s


def save_settings(s):
    _save_json(SETTINGS_FILE, s)


def get_registry():
    return _load_json(REGISTRY_FILE, {})


def save_registry(r):
    _save_json(REGISTRY_FILE, r)


def get_favorites():
    return _load_json(FAVORITES_FILE, [])


def save_favorites(fs):
    _save_json(FAVORITES_FILE, fs)


# ---------- 工具 ----------


def dir_size(path):
    total = 0
    for dirpath, _, fnames in os.walk(path):
        for fn in fnames:
            try:
                total += os.path.getsize(os.path.join(dirpath, fn))
            except OSError:
                pass
    return total


def index_stats(index_path):
    """返回段的统计信息（文件数/哈希数/大小），结果缓存 60s。"""
    cache = getattr(index_stats, '_cache', {})
    now = time.time()
    key = index_path
    if key in cache and now - cache[key][0] < 60:
        return cache[key][1]
    files = hashes = 0
    for f in os.listdir(index_path):
        if f.startswith('shard_') and f.endswith('.sqlite'):
            import sqlite3
            con = sqlite3.connect(os.path.join(index_path, f))
            files += con.execute('SELECT COUNT(*) FROM files').fetchone()[0]
            hashes += con.execute('SELECT COUNT(*) FROM hashes').fetchone()[0]
            con.close()
    info = dict(files=files, hashes=hashes, size=dir_size(index_path))
    cache[key] = (now, info)
    index_stats._cache = cache
    return info


def invalidate_index_stats(base):
    prefix = os.path.abspath(base)
    cache = getattr(index_stats, '_cache', {})
    for path in list(cache):
        absolute = os.path.abspath(path)
        if absolute == prefix or absolute.startswith(prefix + os.sep):
            cache.pop(path, None)


# ---------- 索引加载缓存 ----------

_index_cache = {}
_index_cache_order = []
_index_cache_lock = threading.RLock()
INDEX_CACHE_MAX = 4


def load_segment(seg_dir):
    """加载并缓存段索引（LRU，最多 4 段）。"""
    with _index_cache_lock:
        if seg_dir in _index_cache:
            if seg_dir in _index_cache_order:
                _index_cache_order.remove(seg_dir)
            _index_cache_order.append(seg_dir)
            return _index_cache[seg_dir]
        indexes = load_indexes(seg_dir)
        _index_cache[seg_dir] = indexes
        _index_cache_order.append(seg_dir)
        while len(_index_cache_order) > INDEX_CACHE_MAX:
            old = _index_cache_order.pop(0)
            _index_cache.pop(old, None)
        return indexes


def unload_segment(seg_dir, indexes=None):
    """卸载指定段；indexes 用于避免并发请求误删后来重新加载的实例。"""
    with _index_cache_lock:
        current = _index_cache.get(seg_dir)
        if current is None or (indexes is not None and current is not indexes):
            return
        _index_cache.pop(seg_dir, None)
        if seg_dir in _index_cache_order:
            _index_cache_order.remove(seg_dir)


def unload_index_path(base):
    prefix = os.path.abspath(base)
    with _index_cache_lock:
        for seg_dir in list(_index_cache):
            absolute = os.path.abspath(seg_dir)
            if absolute == prefix or absolute.startswith(prefix + os.sep):
                _index_cache.pop(seg_dir, None)
                if seg_dir in _index_cache_order:
                    _index_cache_order.remove(seg_dir)


def index_metadata(index_path):
    path = os.path.join(index_path, 'index_meta.json')
    data = _load_json(path, {})
    value = data.get('segment_size_mb')
    return int(value) if isinstance(value, (int, float)) and value >= 0 else None


def resolve_index(name, segment=None):
    """按注册名解析索引目录；可选段名。返回 (seg_dir, 段名)。"""
    reg = get_registry()
    if name not in reg:
        raise HTTPException(404, f'索引不存在: {name}')
    base = reg[name]
    segments, seg_names = list_index_segments(base)
    if segment:
        if segment not in seg_names:
            raise HTTPException(404, f'段不存在: {segment}')
        return segments[seg_names.index(segment)], segment
    return segments[0], seg_names[0]


# ---------- 基础 ----------


@app.get('/api/health')
async def health():
    return {'ok': True, 'version': APP_VERSION}


@app.get('/api/version')
def version():
    return {'version': APP_VERSION}


@app.get('/api/settings')
def settings_get():
    return {**get_settings(), 'data_dir': DATA_DIR, 'app_dir': APP_DIR}


class SettingsModel(BaseModel):
    default_index_dir: str | None = None
    lang: str | None = None
    dark: bool | None = None
    theme: str | None = None
    unload_index_after_search: bool | None = None


@app.put('/api/settings')
def settings_put(m: SettingsModel):
    s = get_settings()
    for k, v in m.model_dump(exclude_none=True).items():
        s[k] = v
    save_settings(s)
    return s


# ---------- 索引管理 ----------


@app.get('/api/indexes')
def indexes_list(include_stats: bool = Query(True), refresh_stats: bool = Query(False)):
    reg = get_registry()
    out = []
    for name, base in sorted(reg.items()):
        segments, seg_names = list_index_segments(base)
        seg_info = []
        for seg, sn in zip(segments, seg_names):
            if not include_stats:
                seg_info.append(dict(name=sn, files=None, hashes=None, size=None))
                continue
            try:
                if refresh_stats:
                    getattr(index_stats, '_cache', {}).pop(seg, None)
                st = index_stats(seg)
                seg_info.append(dict(name=sn, **st))
            except Exception:
                seg_info.append(dict(name=sn, files=0, hashes=0, size=0))
        out.append(dict(name=name, path=base, segments=seg_info,
                        segment_size_mb=index_metadata(base),
                        total_hashes=(sum(s['hashes'] or 0 for s in seg_info)
                                      if include_stats else None)))
    return out


class ImportModel(BaseModel):
    name: str = Field(min_length=1)
    path: str = Field(min_length=1)


@app.post('/api/indexes/import')
def indexes_import(m: ImportModel):
    p = os.path.abspath(m.path)
    if not os.path.isdir(p):
        raise HTTPException(400, '目录不存在')
    segments, _ = list_index_segments(p)
    if not segments:
        raise HTTPException(400, '该目录下没有索引分片（shard_*.sqlite），不是有效索引')
    reg = get_registry()
    if m.name in reg and reg[m.name] != p:
        raise HTTPException(400, f'索引名已存在: {m.name}')
    reg[m.name] = p
    save_registry(reg)
    return {'ok': True, 'name': m.name, 'path': p}


@app.delete('/api/indexes/{name}')
def indexes_delete(name: str, delete_files: bool = Query(False)):
    reg = get_registry()
    if name not in reg:
        raise HTTPException(404, f'索引不存在: {name}')
    base = reg[name]
    default_root = os.path.abspath(get_settings()['default_index_dir'])
    if delete_files and os.path.isdir(base):
        if os.path.abspath(base).startswith(default_root + os.sep):
            pass
        else:
            raise HTTPException(400, '索引不在默认索引目录内，为安全起见未删除文件')
    reg.pop(name)
    save_registry(reg)
    unload_index_path(base)
    if delete_files and os.path.isdir(base):
        shutil.rmtree(base, ignore_errors=True)
    return {'ok': True}


# ---------- 构建任务 ----------

_build_job = None
_build_lock = threading.Lock()


class BuildStartModel(BaseModel):
    name: str = Field(min_length=1)
    src_dir: str = Field(min_length=1)
    threads: int = 8
    segment_size_mb: int = Field(default=0, ge=0, le=1048576)
    recursive: bool = False
    incremental: bool = False


@app.post('/api/build/start')
def build_start(m: BuildStartModel):
    global _build_job
    with _build_lock:
        if _build_job and _build_job.get('proc') and _build_job['proc'].poll() is None:
            raise HTTPException(400, '已有构建任务进行中')
        src = os.path.abspath(m.src_dir)
        if not os.path.isdir(src):
            raise HTTPException(400, '音频目录不存在')
        reg = get_registry()
        if m.incremental:
            if m.name not in reg:
                raise HTTPException(404, f'索引不存在: {m.name}')
            out_dir = reg[m.name]
        else:
            if m.name in reg:
                raise HTTPException(400, f'索引名已存在: {m.name}')
            out_dir = os.path.join(get_settings()['default_index_dir'], m.name)
        os.makedirs(out_dir, exist_ok=True)
        unload_index_path(out_dir)
        invalidate_index_stats(out_dir)
        progress_file = os.path.join(TMP_DIR, f'build_{uuid.uuid4().hex[:8]}.jsonl')
        log_file = os.path.join(TMP_DIR, f'build_{uuid.uuid4().hex[:8]}.log')
        cmd = [sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                            'build_index.py'),
               src, '--out', out_dir, '--workers', str(m.threads),
               '--job', progress_file]
        cmd += ['--segment-size-mb', str(m.segment_size_mb)]
        if m.incremental:
            cmd.append('--incremental')
        if m.recursive:
            cmd.append('--recursive')
        flags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        env = dict(os.environ)
        env['PYTHONIOENCODING'] = 'utf-8'  # 日志统一 UTF-8 避免 GBK 乱码
        log_f = open(log_file, 'w', encoding='utf-8')
        proc = subprocess.Popen(cmd, stdout=log_f, stderr=subprocess.STDOUT,
                                creationflags=flags, env=env)
        _build_job = dict(
            name=m.name, src_dir=src, out_dir=out_dir,
            segment_size_mb=m.segment_size_mb,
            threads=m.threads, recursive=m.recursive,
            proc=proc, log_file=log_file, progress_file=progress_file,
            started=time.time(), last='', processed=0, total=0,
            done=0, failed=0, skipped=0, finished=False,
        )
        if m.name not in reg:
            reg[m.name] = out_dir
            save_registry(reg)
        return {'ok': True, 'name': m.name}


def _read_progress(job):
    try:
        with open(job['progress_file'], 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                d = json.loads(line)
                if 'started' in d:
                    job['total'] = d.get('total', 0)
                    continue
                job['last'] = d.get('name', '')
                job['processed'] = d.get('processed', 0)
                job['total'] = d.get('total', 0)
                job['done'] = d.get('done', 0)
                job['failed'] = d.get('failed', 0)
                job['skipped'] = d.get('skipped', 0)
    except Exception:
        pass


@app.get('/api/build/status')
def build_status():
    global _build_job
    with _build_lock:
        if not _build_job:
            return {'running': False}
        job = _build_job
        _read_progress(job)
        proc = job.get('proc')
        running = proc is not None and proc.poll() is None
        if not running and not job.get('finished'):
            job['finished'] = True
        log_tail = ''
        try:
            if os.path.exists(job['log_file']):
                with open(job['log_file'], 'r', encoding='utf-8', errors='replace') as f:
                    lines = f.readlines()[-50:]
                log_tail = ''.join(lines)
        except Exception:
            pass
        return {
            'running': running,
            'name': job['name'], 'src_dir': job['src_dir'], 'out_dir': job['out_dir'],
            'threads': job['threads'],
            'segment_size_mb': job['segment_size_mb'],
            'last': job['last'], 'processed': job['processed'], 'total': job['total'],
            'done': job['done'], 'failed': job['failed'], 'skipped': job['skipped'],
            'elapsed': time.time() - job['started'],
            'log': log_tail,
        }


@app.post('/api/build/cancel')
def build_cancel():
    global _build_job
    with _build_lock:
        if _build_job and _build_job.get('proc'):
            _build_job['proc'].terminate()
            return {'ok': True}
        return {'ok': False, 'detail': '无进行中的任务'}


# ---------- 前端错误上报（诊断用） ----------


class ErrorLogModel(BaseModel):
    message: str = ''
    location: str = ''
    stack: str = ''


@app.post('/api/error-log')
def error_log(m: ErrorLogModel):
    try:
        with open(os.path.join(DATA_DIR, 'error.log'), 'a', encoding='utf-8') as f:
            f.write(f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] {m.location}\n'
                    f'{m.message}\n{m.stack}\n---\n')
    except Exception:
        pass
    return {'ok': True}


# ---------- 检索历史 ----------


def get_history():
    return _load_json(HISTORY_FILE, [])


def save_history(h):
    _save_json(HISTORY_FILE, h)


def add_history(meta, occurrences):
    """保存一次检索到历史（元数据入 history.json，完整结果入 history/{id}.json）。"""
    os.makedirs(HISTORY_DIR, exist_ok=True)
    hid = uuid.uuid4().hex
    try:
        with open(os.path.join(HISTORY_DIR, f'{hid}.json'), 'w', encoding='utf-8') as f:
            json.dump({'id': hid, **meta, 'occurrences': occurrences}, f,
                      ensure_ascii=False)
    except Exception:
        return
    h = get_history()
    h.insert(0, {
        'id': hid, 'time': meta.get('time', ''), 'index_name': meta['index_name'],
        'segment': meta.get('segment'), 'sample': meta.get('sample', ''),
        'hash_count': meta.get('hash_count', 0), 'count': len(occurrences),
    })
    while len(h) > HISTORY_MAX:
        old = h.pop()
        try:
            os.remove(os.path.join(HISTORY_DIR, old['id'] + '.json'))
        except OSError:
            pass
    save_history(h)


@app.get('/api/history')
def history_list():
    return get_history()


@app.get('/api/history/{hid}')
def history_get(hid: str):
    try:
        with open(os.path.join(HISTORY_DIR, f'{hid}.json'), 'r', encoding='utf-8') as f:
            return json.load(f)
    except OSError:
        raise HTTPException(404, '历史记录不存在')


@app.delete('/api/history/{hid}')
def history_delete(hid: str):
    h = get_history()
    h = [x for x in h if x['id'] != hid]
    save_history(h)
    try:
        os.remove(os.path.join(HISTORY_DIR, f'{hid}.json'))
    except OSError:
        pass
    return {'ok': True}


# ---------- 匹配 ----------


class MatchModel(BaseModel):
    index_name: str
    segment: str | None = None
    sample: str
    from_s: float = 0.0
    to_s: float | None = None
    min_aligned: int | None = None
    min_ratio: float | None = None


@app.post('/api/match')
def do_match(m: MatchModel):
    seg_dir, seg_name = resolve_index(m.index_name, m.segment)
    if not os.path.isfile(m.sample):
        raise HTTPException(400, '样本文件不存在')
    indexes = load_segment(seg_dir)
    try:
        y = load_audio(m.sample)
        if m.to_s is not None:
            y = y[int(m.from_s * fp_core.SR):int(m.to_s * fp_core.SR)]
        elif m.from_s > 0:
            y = y[int(m.from_s * fp_core.SR):]
        hs = extract_hashes(y)
        occs = match_index(indexes, hs, min_aligned=m.min_aligned or fp_core.DEFAULT_MIN_ALIGNED,
                           min_ratio=m.min_ratio)
        by_id = {}
        for idx in indexes:
            for row in idx.files:
                by_id[row[0]] = row
        enriched = []
        for o in occs:
            fid, name, path, dur = by_id[o['file_id']]
            o.update(name=name, path=path, file_duration=round(dur, 3))
            o['ratio'] = min(1.0, o['ratio'])
            enriched.append(o)
        add_history({
            'time': time.strftime('%Y-%m-%d %H:%M:%S'),
            'index_name': m.index_name, 'segment': seg_name,
            'sample': m.sample, 'hash_count': len(hs),
        }, enriched)
        return {
            'segment': seg_name, 'index_name': m.index_name,
            'hash_count': len(hs), 'occurrences': enriched,
        }
    finally:
        if get_settings().get('unload_index_after_search', False):
            unload_segment(seg_dir, indexes)


# ---------- 音频流（播放） ----------


@app.get('/api/audio')
def audio(path: str, offset: float | None = Query(None),
          duration: float | None = Query(None)):
    if not path or not os.path.isfile(path):
        raise HTTPException(404, '文件不存在')
    if offset is None:
        return FileResponse(path)
    tmp = os.path.join(TMP_DIR, f'seg_{uuid.uuid4().hex[:8]}.wav')
    cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
           '-ss', f'{max(0.0, offset):.3f}']
    if duration and duration > 0:
        cmd += ['-t', f'{duration + 0.2:.3f}']
    cmd += ['-i', path, '-ac', '2', '-ar', '48000', tmp]
    r = subprocess.run(cmd, capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
    if r.returncode != 0 or not os.path.exists(tmp):
        raise HTTPException(500, f'ffmpeg 切片失败: {r.stderr.decode("utf-8", "ignore")[:200]}')
    return FileResponse(tmp, media_type='audio/wav')


# ---------- 拼接导出 ----------


class ExportModel(BaseModel):
    occurrences: list
    out_path: str
    index_name: str
    segment: str | None = None


@app.post('/api/export')
def do_export(m: ExportModel):
    seg_dir, _ = resolve_index(m.index_name, m.segment)
    indexes = load_segment(seg_dir)
    by_id = {}
    for idx in indexes:
        for row in idx.files:
            by_id[row[0]] = row
    occs = []
    for o in m.occurrences:
        if 'path' in o and o.get('file_id', 0) in (0, -1):
            # 收藏直出：按路径
            occs.append(dict(
                file_id=0, name=os.path.basename(o['path']), path=o['path'],
                file_duration=0.0, offset_file=o['offset_file'], span=o['span'],
                tq0=int(o.get('tq0', 0)), tq1=int(o.get('tq1', 0)),
                aligned=o.get('aligned', 0), ratio=o.get('ratio', 0)))
            continue
        fid, name, path, dur = by_id[int(o['file_id'])]
        occs.append(dict(
            file_id=fid, name=name, path=path, file_duration=dur,
            offset_file=o['offset_file'], span=o['span'],
            tq0=int(o['tq0']), tq1=int(o['tq1']), aligned=o.get('aligned', 0),
            ratio=o.get('ratio', 0)))
    out = os.path.abspath(m.out_path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    total = export_stitch(occs, out)
    return {'ok': True, 'out': out, 'seconds': total}


# ---------- 收藏 ----------


class FavoriteModel(BaseModel):
    name: str
    path: str
    index_name: str
    offset: float
    span: float
    aligned: int = 0
    ratio: float = 0.0


@app.get('/api/favorites')
def favorites_get():
    return get_favorites()


@app.post('/api/favorites')
def favorites_add(m: FavoriteModel):
    fs = get_favorites()
    fs.append({
        'id': uuid.uuid4().hex, 'name': m.name, 'path': m.path,
        'index_name': m.index_name, 'offset': m.offset, 'span': m.span,
        'aligned': m.aligned, 'ratio': m.ratio,
        'added_at': time.strftime('%Y-%m-%d %H:%M:%S'),
    })
    save_favorites(fs)
    return {'ok': True, 'id': fs[-1]['id']}


@app.delete('/api/favorites/{fid}')
def favorites_delete(fid: str):
    fs = get_favorites()
    fs = [f for f in fs if f['id'] != fid]
    save_favorites(fs)
    return {'ok': True}


if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get('CYRENE_PORT', '8765'))
    uvicorn.run(app, host='127.0.0.1', port=port, log_level='warning')
