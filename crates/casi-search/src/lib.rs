//! 检索引擎：时间偏移对齐投票（端口自 backend/fp_core.py match_index）。
//!
//! 检索流程：
//! 1. 查询哈希按 h 分组（ahash）
//! 2. 逐 h 查 .casi → posting (fid, t) 列表
//! 3. delta = t_file - t_query 投票累积；簇内容差 delta_tol=2 帧合并
//! 4. floor = max(min_aligned, ceil(total * min_ratio)) 过滤
//! 5. 输出按 aligned 降序

use casi_core::{DEFAULT_MIN_ALIGNED, FRAME_SEC, HASHES_PER_SEC};
use casi_index::CasiFile;
use ahash::{AHashMap, AHashSet};

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Occurrence {
    pub file_id: u32,
    pub aligned: u32,
    pub ratio: f64,
    pub tq0: u32,
    pub tq1: u32,
    /// 样本起点 (t_q=0) 对应的文件时刻（帧），乘 FRAME_SEC 得秒
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

/// 自适应 min_ratio（与 Python 一致）：
/// dur_est = 查询哈希数 / 900；ratio = clamp(3/max(dur_est, 0.5), 0.001..0.008)
pub fn adaptive_min_ratio(query_len: usize) -> f64 {
    let dur_est = query_len as f64 / HASHES_PER_SEC;
    (3.0 / dur_est.max(0.5)).clamp(0.001, 0.008)
}

/// 单次检索入口。indexes: 待查的 .casi mmap 集合（可能多个段/分片）。
///
/// 返回 occurrences，按 aligned 降序。
pub fn match_index(
    indexes: &[&CasiFile],
    query_hashes: &[(u32, u32)],
    min_aligned: Option<u32>,
    min_ratio: Option<f64>,
    delta_tol: i64,
) -> Vec<Occurrence> {
    let min_ratio = min_ratio.unwrap_or_else(|| adaptive_min_ratio(query_hashes.len()));
    let min_aligned = min_aligned.unwrap_or(DEFAULT_MIN_ALIGNED);

    // 查询哈希去重：h -> all tq（保持首次出现顺序，等价 Python defaultdict 插入序）
    let mut uniq: AHashMap<u32, Vec<u32>> = AHashMap::default();
    for &(h, tq) in query_hashes {
        uniq.entry(h).or_default().push(tq);
    }

    // (fid, delta) -> [cnt, min_tq, max_tq]
    #[derive(Default)]
    struct Acc {
        cnt: u32,
        tq_min: u32,
        tq_max: u32,
    }
    let mut acc: AHashMap<(u32, i64), Acc> = AHashMap::default();

    for index in indexes {
        for (&h, tqs) in &uniq {
            let range = index.lookup(h);
            if range.start == usize::MAX || range.start == range.end {
                continue;
            }
            let len = range.end - range.start;
            if len == 1 {
                // 快速路径：单行命中
                let p = index.posting(range.start);
                for &tq in tqs {
                    let delta = p.t as i64 - tq as i64;
                    let key = (p.fid, delta);
                    let e = acc.entry(key).or_default();
                    let fresh = e.cnt == 0;
                    e.cnt += 1;
                    if fresh {
                        e.tq_min = tq;
                    } else {
                        e.tq_min = e.tq_min.min(tq);
                    }
                    e.tq_max = e.tq_max.max(tq);
                }
                continue;
            }
            // 一般路径：delta 去重 + 首行文件归属（复刻 np.unique 语义）
            for &tq in tqs {
                let mut pairs: Vec<(i64, u32, usize)> = Vec::with_capacity(len);
                for (i, irow) in (range.start..range.end).enumerate() {
                    let p = index.posting(irow);
                    pairs.push((p.t as i64 - tq as i64, p.fid, i));
                }
                pairs.sort_by_key(|&(d, _, _)| d);
                let mut k = 0;
                while k < pairs.len() {
                    let mut j = k;
                    while j < pairs.len() && pairs[j].0 == pairs[k].0 {
                        j += 1;
                    }
                    let delta = pairs[k].0;
                    let fid = pairs[k].1; // 首行（稳定排序 → 原行序最小编号）
                    let cnt = (j - k) as u32;
                    let key = (fid, delta);
                    let e = acc.entry(key).or_default();
                    let fresh = e.cnt == 0;
                    e.cnt += cnt;
                    if fresh {
                        e.tq_min = tq;
                    } else {
                        e.tq_min = e.tq_min.min(tq);
                    }
                    e.tq_max = e.tq_max.max(tq);
                    k = j;
                }
            }
        }
    }

    // 按文件分桶
    let mut by_fid: AHashMap<u32, Vec<(i64, u32, u32, u32)>> = AHashMap::default();
    for ((fid, delta), a) in acc {
        by_fid.entry(fid).or_default().push((delta, a.cnt, a.tq_min, a.tq_max));
    }

    let total = query_hashes.len() as u32;
    let floor = min_aligned.max(((total as f64) * min_ratio).ceil() as u32);

    let mut occurrences = Vec::new();
    for (fid, mut items) in by_fid {
        items.sort_by_key(|r| r.0);
        // 簇：[最强delta, 总计数, 最强桶计数, min_tq, max_tq]
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
        for (d, cnt, _strong, tq0, tq1) in clusters {
            if cnt < floor {
                continue;
            }
            occurrences.push(Occurrence {
                file_id: fid,
                aligned: cnt,
                ratio: cnt as f64 / total as f64,
                tq0,
                tq1,
                offset_frame: d,
                frame_delta: d,
            });
        }
    }
    occurrences.sort_by(|a, b| b.aligned.cmp(&a.aligned));
    occurrences
}

/// 查询哈希集合（h 全集），用于预过滤/统计。
pub fn unique_hashes(query: &[(u32, u32)]) -> usize {
    let set: AHashSet<u32> = query.iter().map(|&(h, _)| h).collect();
    set.len()
}

/// 便捷：单个 .casi 检索。
pub fn match_single(
    index: &CasiFile,
    query_hashes: &[(u32, u32)],
    min_aligned: Option<u32>,
    min_ratio: Option<f64>,
) -> Vec<Occurrence> {
    match_index(&[index], query_hashes, min_aligned, min_ratio, 2)
}

#[cfg(test)]
mod tests {
    use super::*;
    use casi_index::{builder::Builder, builder::Posting, FileMeta};

    fn open_temp_casi(rows: Vec<(u32, u32, u32)>, files: Vec<FileMeta>) -> (tempfile::TempDir, CasiFile) {
        let td = tempfile::tempdir().unwrap();
        let mut b = Builder::with_dir(td.path().to_path_buf(), 1024);
        for (h, fid, t) in rows {
            b.push(Posting { h, fid, t });
        }
        for f in files {
            b.add_file(f);
        }
        let out = td.path().join("t.casi");
        b.finish(&out).unwrap();
        let cf = CasiFile::open(&out).unwrap();
        (td, cf)
    }

    #[test]
    fn exact_match_finds_hit() {
        // lib: 3 个哈希 (h=1..3) 文件1 时间 100/200/300
        let (td, cf) = open_temp_casi(
            vec![
                (1, 1, 100),
                (2, 1, 200),
                (3, 1, 300),
                (1, 2, 900),  // 文件2 噪声
            ],
            vec![
                FileMeta { fid: 1, name: "song1.wav".into(), path: "a.wav".into(), duration: 10.0, status: 1 },
                FileMeta { fid: 2, name: "song2.wav".into(), path: "b.wav".into(), duration: 20.0, status: 1 },
            ],
        );
        // 查询：采样 100/200/300 三帧处哈希（delta=0）
        let q = vec![(1u32, 100u32), (2, 200), (3, 300)];
        let occs = match_index(&[&cf], &q, Some(3), Some(0.5), 2);
        assert_eq!(occs.len(), 1);
        assert_eq!(occs[0].file_id, 1);
        assert_eq!(occs[0].aligned, 3);
        assert_eq!(occs[0].offset_frame, 0);
        drop(td);
    }

    #[test]
    fn cluster_merges_with_tolerance() {
        // 一个文件, 两个近邻 delta (0 与 2) → 合并
        let (td, cf) = open_temp_casi(
            vec![(1, 1, 10), (2, 1, 12)],
            vec![FileMeta { fid: 1, name: "s".into(), path: "p".into(), duration: 1.0, status: 1 }],
        );
        let q = vec![(1u32, 10u32), (2, 10)];
        let occs = match_index(&[&cf], &q, Some(2), Some(0.5), 2);
        assert_eq!(occs.len(), 1);
        assert_eq!(occs[0].aligned, 2);
        assert_eq!(occs[0].offset_frame, 0); // 最强桶(2 条)取 0
        drop(td);
    }

    #[test]
    fn adaptive_ratio_behaves() {
        // 极短样本 → clamp 到上限 0.008；超长样本 → 下限 0.001
        assert_eq!(adaptive_min_ratio(500), 0.008);
        assert_eq!(adaptive_min_ratio(50_000_000), 0.001);
        // 长链中段: dur_est = 900 秒 → 3/900 = 0.0033
        let r_mid = adaptive_min_ratio(900 * 900);
        assert!(r_mid > 0.001 && r_mid < 0.008);
        assert!((r_mid - 3.0 / 900.0).abs() < 1e-9);
    }
}
