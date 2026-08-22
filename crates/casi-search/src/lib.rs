//! 检索引擎：时间偏移对齐投票（端口自 backend/fp_core.py match_index）。
//!
//! 检索流程：
//! 1. 查询哈希按 h 分组
//! 2. 逐 h 查 .casi → posting (fid, t) 列表
//! 3. 投票：单线程遍历 + delta 线性去重（同 h 内 t 有序 → delta 单调）
//! 4. 按文件分桶 → 并行聚簇（rayon）
//! 5. 输出

use ahash::AHashMap;
use rayon::prelude::*;

use casi_index::CasiFile;

pub const DEFAULT_MIN_ALIGNED: u32 = 8;
pub const HASHES_PER_SEC: f64 = 900.0;
pub const FRAME_SEC: f64 = casi_core::FRAME_SEC;

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Occurrence {
    pub file_id: u32,
    pub aligned: u32,
    pub ratio: f64,
    pub tq0: u32,
    pub tq1: u32,
    pub offset_frame: i64,
    pub frame_delta: i64,
}

impl Occurrence {
    pub fn offset_file_sec(&self) -> f64 {
        self.offset_frame as f64 * FRAME_SEC
    }
    pub fn span_sec(&self) -> f64 {
        (self.tq1 - self.tq0) as f64 * FRAME_SEC
    }
}

pub fn adaptive_min_ratio(query_len: usize) -> f64 {
    let dur_est = query_len as f64 / HASHES_PER_SEC;
    (3.0 / dur_est.max(0.5)).clamp(0.001, 0.008)
}

pub fn unique_hashes(query: &[(u32, u32)]) -> usize {
    use std::collections::HashSet;
    let set: HashSet<u32> = query.iter().map(|&(h, _)| h).collect();
    set.len()
}

pub fn match_single(
    index: &CasiFile,
    query_hashes: &[(u32, u32)],
    min_aligned: Option<u32>,
    min_ratio: Option<f64>,
) -> Vec<Occurrence> {
    match_index(&[index], query_hashes, min_aligned, min_ratio, 2)
}

pub fn match_index(
    indexes: &[&CasiFile],
    query_hashes: &[(u32, u32)],
    min_aligned: Option<u32>,
    min_ratio: Option<f64>,
    delta_tol: i64,
) -> Vec<Occurrence> {
    let min_ratio = min_ratio.unwrap_or_else(|| adaptive_min_ratio(query_hashes.len()));
    let min_aligned = min_aligned.unwrap_or(DEFAULT_MIN_ALIGNED);

    let mut uniq: AHashMap<u32, Vec<u32>> = AHashMap::default();
    for &(h, tq) in query_hashes {
        uniq.entry(h).or_default().push(tq);
    }

    // (fid, delta) -> [cnt, min_tq, max_tq]
    struct Acc {
        cnt: u32,
        tq_min: u32,
        tq_max: u32,
    }

    // ── 预过滤：并行扫描统计每个文件命中次数，筛掉99%噪声 ──
    const TOP_K: usize = 500;
    let keys: Vec<u32> = uniq.keys().copied().collect();
    let n_threads = rayon::current_num_threads().max(1);
    let chunk_size = (keys.len() / n_threads).max(256);

    let fid_freq: AHashMap<u32, u32> = keys.par_chunks(chunk_size).fold(
        || AHashMap::new(),
        |mut local, chunk| {
            for index in indexes {
                for &h in chunk {
                    let range = index.lookup(h);
                    if range.start == usize::MAX || range.start >= range.end { continue; }
                    for irow in range.start..range.end {
                        let p = index.posting(irow);
                        *local.entry(p.fid).or_insert(0) += 1;
                    }
                }
            }
            local
        },
    ).reduce(
        || AHashMap::new(),
        |mut a, b| {
            for (k, v) in b { *a.entry(k).or_insert(0) += v; }
            a
        },
    );

    let mut top_fids: Vec<(u32, u32)> = fid_freq.into_iter().collect();
    top_fids.sort_unstable_by(|a, b| b.1.cmp(&a.1));
    top_fids.truncate(TOP_K);
    let candidate_set: std::collections::HashSet<u32> = top_fids.iter().map(|&(f, _)| f).collect();
    drop(top_fids);

    // 投票（并行：acc 只含候选文件条目，每线程几百 KB，fold+reduce 安全）
    let acc: AHashMap<(u32, i64), Acc> = keys.par_chunks(chunk_size).fold(
        || AHashMap::new(),
        |mut local: AHashMap<(u32, i64), Acc>, chunk| {
            for index in indexes {
                for &h in chunk {
                    let tqs = &uniq[&h];
                    let range = index.lookup(h);
                    if range.start == usize::MAX || range.start >= range.end {
                        continue;
                    }
                    let len = range.end - range.start;
                    if len == 1 {
                        let p = index.posting(range.start);
                        if !candidate_set.contains(&p.fid) { continue; }
                        for &tq in tqs {
                            let delta = p.t as i64 - tq as i64;
                            let e = local.entry((p.fid, delta)).or_insert_with(|| Acc {
                                cnt: 0, tq_min: u32::MAX, tq_max: 0,
                            });
                            e.cnt += 1;
                            e.tq_min = e.tq_min.min(tq);
                            e.tq_max = e.tq_max.max(tq);
                        }
                        continue;
                    }
                    for &tq in tqs {
                        let mut last_d: i64 = i64::MIN;
                        let mut cur_fid = 0u32;
                        let mut cur_cnt: u32 = 0;
                        for irow in range.start..range.end {
                            let p = index.posting(irow);
                            if !candidate_set.contains(&p.fid) { continue; }
                            let d = p.t as i64 - tq as i64;
                            if d == last_d {
                                cur_cnt += 1;
                            } else {
                                if cur_cnt > 0 {
                                    let e = local.entry((cur_fid, last_d)).or_insert_with(|| Acc {
                                        cnt: 0, tq_min: u32::MAX, tq_max: 0,
                                    });
                                    e.cnt += cur_cnt;
                                    e.tq_min = e.tq_min.min(tq);
                                    e.tq_max = e.tq_max.max(tq);
                                }
                                last_d = d;
                                cur_fid = p.fid;
                                cur_cnt = 1;
                            }
                        }
                        if cur_cnt > 0 {
                            let e = local.entry((cur_fid, last_d)).or_insert_with(|| Acc {
                                cnt: 0, tq_min: u32::MAX, tq_max: 0,
                            });
                            e.cnt += cur_cnt;
                            e.tq_min = e.tq_min.min(tq);
                            e.tq_max = e.tq_max.max(tq);
                        }
                    }
                }
            }
            local
        },
    ).reduce(
        || AHashMap::new(),
        |mut a, b| {
            if b.len() > a.len() {
                for (k, v) in b {
                    let e = a.entry(k).or_insert_with(|| Acc { cnt: 0, tq_min: u32::MAX, tq_max: 0 });
                    e.cnt += v.cnt;
                    e.tq_min = e.tq_min.min(v.tq_min);
                    e.tq_max = e.tq_max.max(v.tq_max);
                }
                a
            } else {
                for (k, v) in b {
                    let e = a.entry(k).or_insert_with(|| Acc { cnt: 0, tq_min: u32::MAX, tq_max: 0 });
                    e.cnt += v.cnt;
                    e.tq_min = e.tq_min.min(v.tq_min);
                    e.tq_max = e.tq_max.max(v.tq_max);
                }
                a
            }
        },
    );

    // 按文件分桶
    let mut by_fid: AHashMap<u32, Vec<(i64, u32, u32, u32)>> = AHashMap::new();
    for ((fid, delta), a) in acc {
        by_fid.entry(fid).or_default().push((delta, a.cnt, a.tq_min, a.tq_max));
    }

    let total = query_hashes.len() as f64;
    let floor = min_aligned.max((total * min_ratio).ceil() as u32);

    // 并行聚簇（每个文件独立排序+聚类，多核无内存争抢）
    let entries: Vec<(u32, Vec<(i64, u32, u32, u32)>)> = by_fid.into_iter().collect();
    let mut occurrences: Vec<Occurrence> = entries
        .into_par_iter()
        .flat_map(|(fid, mut items)| {
            items.sort_unstable_by_key(|r| r.0);
            let mut clusters: Vec<(i64, u32, u32, u32, u32)> = Vec::new();
            for (d, cnt, tq0, tq1) in items {
                if let Some(cur) = clusters.last_mut() {
                    if (d - cur.0).abs() <= delta_tol {
                        if cnt > cur.2 {
                            cur.0 = d;
                            cur.2 = cnt;
                        }
                        cur.1 += cnt;
                        cur.3 = cur.3.min(tq0);
                        cur.4 = cur.4.max(tq1);
                        continue;
                    }
                }
                clusters.push((d, cnt, cnt, tq0, tq1));
            }
            let fl = floor;
            clusters
                .into_iter()
                .filter_map(move |(d, cnt, _s, tq0, tq1)| {
                    if cnt < fl {
                        return None;
                    }
                    Some(Occurrence {
                        file_id: fid,
                        aligned: cnt,
                        ratio: cnt as f64 / total,
                        tq0,
                        tq1,
                        offset_frame: d,
                        frame_delta: d,
                    })
                })
                .collect::<Vec<_>>()
        })
        .collect();

    occurrences.sort_by(|a, b| b.aligned.cmp(&a.aligned));
    occurrences
}
