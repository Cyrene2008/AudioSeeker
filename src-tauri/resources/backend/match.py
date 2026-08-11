"""match.py - 用样本音频匹配指纹库。

用法:
  python match.py 样本.wav [--db index] [--from S] [--to S] [--min-aligned N]
                 [--min-ratio R] [--json out.json] [--export out.wav]
                 [--top N] [--silent]

长样本（拼接/混剪）会列出其中包含的所有库文件及各自偏移；
短切片会定位到源文件与文件内偏移；--export 按样本时间线从库中拼接还原。
"""

import argparse
import json
import os
import sys
import time

import fp_core
from fp_core import (load_audio, extract_hashes, load_indexes, match_index,
                     export_stitch)


def enrich(indexes, occs):
    by_id = {}
    for idx in indexes:
        for row in idx.files:
            by_id[row[0]] = row
    for o in occs:
        fid, name, path, dur = by_id[o['file_id']]
        o['name'] = name
        o['path'] = path
        o['file_duration'] = round(dur, 3)
    return occs


def run_match(sample, indexes, from_s=0.0, to_s=None, min_aligned=None,
              min_ratio=None):
    y, _ = fp_core_lib_load(sample)
    if to_s is not None:
        y = y[int(from_s * fp_core.SR):int(to_s * fp_core.SR)]
    elif from_s > 0:
        y = y[int(from_s * fp_core.SR):]
    hs = extract_hashes(y)
    occs = match_index(indexes, hs,
                       min_aligned=min_aligned or fp_core.DEFAULT_MIN_ALIGNED,
                       min_ratio=min_ratio)
    return enrich(indexes, occs)


def fp_core_lib_load(sample):
    return fp_core.load_audio(sample), fp_core.SR


def fmt(s):
    m, s = divmod(int(round(s)), 60)
    return f'{m}:{s:02d}'


def main():
    ap = argparse.ArgumentParser(description='音频样本 -> 指纹库匹配')
    ap.add_argument('sample')
    ap.add_argument('--db', default=os.path.join(
        os.path.dirname(os.path.abspath(__file__)), 'index'))
    ap.add_argument('--from', dest='from_s', type=float, default=0.0)
    ap.add_argument('--to', dest='to_s', type=float, default=None)
    ap.add_argument('--min-aligned', type=int, default=None)
    ap.add_argument('--min-ratio', type=float, default=None)
    ap.add_argument('--top', type=int, default=0)
    ap.add_argument('--json', default=None)
    ap.add_argument('--export', default=None)
    args = ap.parse_args()

    t0 = time.time()
    indexes = load_indexes(args.db)
    if not indexes:
        print(f'索引目录为空: {args.db}，请先运行 build_index.py')
        sys.exit(1)
    print(f'载入 {len(indexes)} 个分片 ({time.time()-t0:.1f}s)')

    occs = run_match(args.sample, indexes, args.from_s, args.to_s,
                     args.min_aligned, args.min_ratio)
    print(f'样本哈希匹配完成, 共 {len(occs)} 处命中, 耗时 {time.time()-t0:.1f}s')
    print()
    print(f'{"#":>3}  {"文件":<22} {"文件内偏移":>12} {"样本区间":>14} '
          f'{"命中数":>7} {"置信度":>8} {"文件时长":>10}')
    print('-' * 90)
    for i, o in enumerate(occs[:args.top or len(occs)], 1):
        print(f'{i:>3}  {o["name"]:<22} {fmt(o["offset_file"]):>12} '
              f'{fmt(o["tq0"]*fp_core.FRAME_SEC)}-{fmt(o["tq1"]*fp_core.FRAME_SEC):>8} '
              f'{o["aligned"]:>7} {o["ratio"]*100:>7.2f}% {fmt(o["file_duration"]):>10}')

    if args.json:
        with open(args.json, 'w', encoding='utf-8') as f:
            json.dump(occs, f, ensure_ascii=False, indent=2)
        print(f'\nJSON 已写入 {args.json}')

    if args.export and occs:
        total = export_stitch(occs, args.export)
        print(f'\n已拼接导出 {args.export}（共 {total:.1f}s）')


if __name__ == '__main__':
    main()
