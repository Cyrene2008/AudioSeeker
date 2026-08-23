//! `.casi` 检索引擎：候选预过滤 + 多核稠密时间偏移投票。
//!
//! 索引始终通过 mmap 共享；检索不会为每个核心复制索引或海量 HashMap。
//! 第一遍并行统计候选文件和时间范围，第二遍使用共享的稠密 delta 数组
//! 投票。候选按内存预算分批，因此峰值内存有确定上限。

use ahash::AHashMap;
use rayon::prelude::*;
use std::sync::atomic::{AtomicU32, Ordering};

use casi_index::CasiFile;

pub const DEFAULT_MIN_ALIGNED: u32 = 8;
pub const HASHES_PER_SEC: f64 = 900.0;
pub const FRAME_SEC: f64 = casi_core::FRAME_SEC;
pub const MIN_MEMORY_BUDGET_MB: usize = 512;
pub const MAX_MEMORY_BUDGET_MB: usize = 8192;

/// 自动使用当前可用物理内存的 35%，同时保留足够空间给 mmap 页面缓存、
/// WebView、频谱和系统。返回值范围 512MB~8GB。
pub fn recommended_memory_budget_mb() -> usize {
    use sysinfo::System;

    let mut system = System::new();
    system.refresh_memory();
    let available_mb = (system.available_memory() / (1024 * 1024)) as usize;
    (available_mb.saturating_mul(35) / 100).clamp(MIN_MEMORY_BUDGET_MB, MAX_MEMORY_BUDGET_MB)
}

pub fn effective_memory_budget_mb(memory_budget_mb: usize) -> usize {
    if memory_budget_mb == 0 {
        recommended_memory_budget_mb()
    } else {
        memory_budget_mb.clamp(64, MAX_MEMORY_BUDGET_MB)
    }
}

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

#[derive(Clone, Copy)]
struct FileStats {
    votes_upper_bound: u64,
    min_t: u32,
    max_t: u32,
}

impl FileStats {
    fn new(t: u32, weight: u64) -> Self {
        Self { votes_upper_bound: weight, min_t: t, max_t: t }
    }

    fn update(&mut self, t: u32, weight: u64) {
        self.votes_upper_bound = self.votes_upper_bound.saturating_add(weight);
        self.min_t = self.min_t.min(t);
        self.max_t = self.max_t.max(t);
    }

    fn merge(&mut self, other: FileStats) {
        self.votes_upper_bound = self.votes_upper_bound.saturating_add(other.votes_upper_bound);
        self.min_t = self.min_t.min(other.min_t);
        self.max_t = self.max_t.max(other.max_t);
    }
}

struct VoteCell {
    count: AtomicU32,
    tq_min: AtomicU32,
    tq_max: AtomicU32,
}

impl VoteCell {
    fn new() -> Self {
        Self {
            count: AtomicU32::new(0),
            tq_min: AtomicU32::new(u32::MAX),
            tq_max: AtomicU32::new(0),
        }
    }
}

const _: () = assert!(std::mem::size_of::<VoteCell>() == 12);

#[derive(Clone, Copy)]
struct CandidateSpec {
    fid: u32,
    min_delta: i64,
    cells: usize,
    upper_bound: u64,
    fragmented: bool,
}

struct DenseCandidate {
    spec: CandidateSpec,
    bins: Vec<VoteCell>,
}

pub fn adaptive_min_ratio(query_len: usize) -> f64 {
    let dur_est = query_len as f64 / HASHES_PER_SEC;
    (3.0 / dur_est.max(0.5)).clamp(0.001, 0.008)
}

pub fn unique_hashes(query: &[(u32, u32)]) -> usize {
    let mut unique = AHashMap::<u32, ()>::new();
    for &(hash, _) in query {
        unique.insert(hash, ());
    }
    unique.len()
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
    match_index_with_config(
        indexes,
        query_hashes,
        min_aligned,
        min_ratio,
        delta_tol,
        0,
        0,
    )
}

/// `threads == 0` 使用全部逻辑核心；`memory_budget_mb` 是稠密投票数组的
/// 硬预算。超出预算时自动把候选分批处理，不会因样本过长而 OOM。
pub fn match_index_with_config(
    indexes: &[&CasiFile],
    query_hashes: &[(u32, u32)],
    min_aligned: Option<u32>,
    min_ratio: Option<f64>,
    delta_tol: i64,
    threads: usize,
    memory_budget_mb: usize,
) -> Vec<Occurrence> {
    if query_hashes.is_empty() || indexes.is_empty() {
        return Vec::new();
    }

    let min_ratio = min_ratio.unwrap_or_else(|| adaptive_min_ratio(query_hashes.len()));
    let floor = min_aligned
        .unwrap_or(DEFAULT_MIN_ALIGNED)
        .max((query_hashes.len() as f64 * min_ratio).ceil() as u32);

    let mut uniq: AHashMap<u32, Vec<u32>> = AHashMap::default();
    let mut tq_min = u32::MAX;
    let mut tq_max = 0u32;
    for &(hash, tq) in query_hashes {
        uniq.entry(hash).or_default().push(tq);
        tq_min = tq_min.min(tq);
        tq_max = tq_max.max(tq);
    }
    let keys: Vec<u32> = uniq.keys().copied().collect();

    let run = || {
        let worker_count = rayon::current_num_threads().max(1);
        let chunk_size = (keys.len() / (worker_count * 4)).max(128);

        // 第一遍：只保留每个 fid 的票数上界和 posting 时间范围。
        // 权重乘以相同查询哈希的 tq 数，因此 freq < floor 的文件理论上
        // 不可能产生合法 occurrence，过滤不会降低召回率。
        let stats = keys
            .par_chunks(chunk_size)
            .fold(AHashMap::<u32, FileStats>::new, |mut local, chunk| {
                for index in indexes {
                    for &hash in chunk {
                        let Some(tqs) = uniq.get(&hash) else { continue };
                        let range = index.lookup(hash);
                        if range.start == usize::MAX || range.start >= range.end {
                            continue;
                        }
                        let weight = tqs.len() as u64;
                        for row in range {
                            let posting = index.posting(row);
                            local
                                .entry(posting.fid)
                                .and_modify(|s| s.update(posting.t, weight))
                                .or_insert_with(|| FileStats::new(posting.t, weight));
                        }
                    }
                }
                local
            })
            .reduce(AHashMap::<u32, FileStats>::new, |mut left, right| {
                for (fid, stat) in right {
                    left.entry(fid)
                        .and_modify(|s| s.merge(stat))
                        .or_insert(stat);
                }
                left
            });

        let mut candidates: Vec<CandidateSpec> = stats
            .into_iter()
            .filter_map(|(fid, stat)| {
                if stat.votes_upper_bound < floor as u64 {
                    return None;
                }
                let min_delta = stat.min_t as i64 - tq_max as i64;
                let max_delta = stat.max_t as i64 - tq_min as i64;
                let span = max_delta.checked_sub(min_delta)?.checked_add(1)?;
                let cells = usize::try_from(span).ok()?;
                Some(CandidateSpec {
                    fid,
                    min_delta,
                    cells,
                    upper_bound: stat.votes_upper_bound,
                    fragmented: false,
                })
            })
            .collect();

        // 先处理高上界候选；通常所有候选一次即可放入预算。
        candidates.sort_unstable_by(|a, b| b.upper_bound.cmp(&a.upper_bound));
        if candidates.is_empty() {
            return Vec::new();
        }

        let effective_memory_mb = effective_memory_budget_mb(memory_budget_mb);
        let budget_bytes = effective_memory_mb * 1024 * 1024;
        let max_cells = (budget_bytes / std::mem::size_of::<VoteCell>()).max(1);
        let mut split_candidates = Vec::new();
        for spec in candidates {
            let fragmented = spec.cells > max_cells;
            let mut min_delta = spec.min_delta;
            let end_delta = spec.min_delta + spec.cells as i64;
            while min_delta < end_delta {
                let cells = (end_delta - min_delta) as usize;
                let cells = cells.min(max_cells);
                split_candidates.push(CandidateSpec {
                    fid: spec.fid,
                    min_delta,
                    cells,
                    upper_bound: spec.upper_bound,
                    fragmented,
                });
                min_delta += cells as i64;
            }
        }
        let mut batches: Vec<Vec<CandidateSpec>> = Vec::new();
        let mut current = Vec::new();
        let mut current_bytes = 0usize;
        for spec in split_candidates {
            let bytes = spec.cells.saturating_mul(std::mem::size_of::<VoteCell>());
            if !current.is_empty() && current_bytes.saturating_add(bytes) > budget_bytes {
                batches.push(std::mem::take(&mut current));
                current_bytes = 0;
            }
            current_bytes = current_bytes.saturating_add(bytes);
            current.push(spec);
        }
        if !current.is_empty() {
            batches.push(current);
        }

        let estimated_mb: usize = batches
            .iter()
            .flat_map(|b| b.iter())
            .map(|s| s.cells * std::mem::size_of::<VoteCell>())
            .sum::<usize>()
            / (1024 * 1024);
        eprintln!(
            "[casi] candidates={} vote_memory={}MB budget={}MB batches={} threads={}",
            batches.iter().map(Vec::len).sum::<usize>(),
            estimated_mb,
            effective_memory_mb,
            batches.len(),
            worker_count,
        );

        let mut occurrences = Vec::new();
        for specs in batches {
            let mut dense: Vec<DenseCandidate> = Vec::with_capacity(specs.len());
            for spec in specs {
                let mut bins = Vec::new();
                if bins.try_reserve_exact(spec.cells).is_err() {
                    eprintln!(
                        "[casi] skip candidate fid={} ({} cells): allocation rejected",
                        spec.fid,
                        spec.cells,
                    );
                    continue;
                }
                bins.resize_with(spec.cells, VoteCell::new);
                dense.push(DenseCandidate { spec, bins });
            }
            if dense.is_empty() {
                continue;
            }
            let mut lookup: AHashMap<u32, Vec<usize>> = AHashMap::new();
            for (index, candidate) in dense.iter().enumerate() {
                lookup.entry(candidate.spec.fid).or_default().push(index);
            }

            // 第二遍：所有线程只读 mmap，并共享一份原子投票数组。
            keys.par_chunks(chunk_size).for_each(|chunk| {
                for index in indexes {
                    for &hash in chunk {
                        let Some(tqs) = uniq.get(&hash) else { continue };
                        let range = index.lookup(hash);
                        if range.start == usize::MAX || range.start >= range.end {
                            continue;
                        }
                        for row in range {
                            let posting = index.posting(row);
                            let Some(slots) = lookup.get(&posting.fid) else { continue };
                            for &tq in tqs {
                                let delta = posting.t as i64 - tq as i64;
                                let Some(&slot) = slots.iter().find(|&&slot| {
                                    let spec = dense[slot].spec;
                                    delta >= spec.min_delta
                                        && delta < spec.min_delta + spec.cells as i64
                                }) else {
                                    continue;
                                };
                                let candidate = &dense[slot];
                                let bin = (delta - candidate.spec.min_delta) as usize;
                                let cell = &candidate.bins[bin];
                                cell.count.fetch_add(1, Ordering::Relaxed);
                                cell.tq_min.fetch_min(tq, Ordering::Relaxed);
                                cell.tq_max.fetch_max(tq, Ordering::Relaxed);
                            }
                        }
                    }
                }
            });

            let mut batch_occurrences: Vec<Occurrence> = dense
                .into_par_iter()
                .flat_map_iter(|candidate| {
                    let mut clusters: Vec<(i64, u32, u32, u32, u32)> = Vec::new();
                    for (index, cell) in candidate.bins.into_iter().enumerate() {
                        let count = cell.count.load(Ordering::Relaxed);
                        if count == 0 {
                            continue;
                        }
                        let delta = candidate.spec.min_delta + index as i64;
                        let q0 = cell.tq_min.load(Ordering::Relaxed);
                        let q1 = cell.tq_max.load(Ordering::Relaxed);
                        if let Some(current) = clusters.last_mut() {
                            if (delta - current.0).abs() <= delta_tol {
                                if count > current.2 {
                                    current.0 = delta;
                                    current.2 = count;
                                }
                                current.1 += count;
                                current.3 = current.3.min(q0);
                                current.4 = current.4.max(q1);
                                continue;
                            }
                        }
                        clusters.push((delta, count, count, q0, q1));
                    }
                    clusters.into_iter().filter_map(move |(delta, count, _, q0, q1)| {
                            if count < floor && !candidate.spec.fragmented {
                            return None;
                        }
                        Some(Occurrence {
                            file_id: candidate.spec.fid,
                            aligned: count,
                            ratio: count as f64 / query_hashes.len() as f64,
                            tq0: q0,
                            tq1: q1,
                            offset_frame: delta,
                            frame_delta: delta,
                        })
                    })
                })
                .collect();
            occurrences.append(&mut batch_occurrences);
        }

        occurrences.sort_unstable_by(|a, b| {
            a.file_id
                .cmp(&b.file_id)
                .then_with(|| a.offset_frame.cmp(&b.offset_frame))
        });
        let mut merged: Vec<Occurrence> = Vec::with_capacity(occurrences.len());
        for occurrence in occurrences {
            if let Some(current) = merged.last_mut() {
                if current.file_id == occurrence.file_id
                    && (occurrence.offset_frame - current.offset_frame).abs() <= delta_tol
                {
                    if occurrence.aligned > current.aligned {
                        current.offset_frame = occurrence.offset_frame;
                        current.frame_delta = occurrence.frame_delta;
                    }
                    current.aligned = current.aligned.saturating_add(occurrence.aligned);
                    current.ratio = current.aligned as f64 / query_hashes.len() as f64;
                    current.tq0 = current.tq0.min(occurrence.tq0);
                    current.tq1 = current.tq1.max(occurrence.tq1);
                    continue;
                }
            }
            merged.push(occurrence);
        }
        merged.retain(|occurrence| occurrence.aligned >= floor);
        merged.sort_unstable_by(|a, b| b.aligned.cmp(&a.aligned));
        merged
    };

    if threads == 0 || threads == rayon::current_num_threads() {
        run()
    } else {
        match rayon::ThreadPoolBuilder::new().num_threads(threads.max(1)).build() {
            Ok(pool) => pool.install(run),
            Err(_) => run(),
        }
    }
}
