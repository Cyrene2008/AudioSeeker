//! match / stats 子命令。

use std::path::{Path, PathBuf};

use casi_index::CasiFile;
use casi_search::{match_index, Occurrence};

use crate::util::{fmt_sec, load_and_trim};

pub struct OpenedIndex {
    pub file: CasiFile,
    path: PathBuf,
}

/// 打开索引目录（找 index.casi）或单个 .casi 文件。
pub fn open_index_files(index: &Path) -> Result<Vec<OpenedIndex>, String> {
    let mut files = Vec::new();
    let paths: Vec<PathBuf> = if index.is_file() {
        vec![index.to_path_buf()]
    } else {
        let mut v = Vec::new();
        let dir_reading = std::fs::read_dir(index).map_err(|e| format!("{e}"))?;
        for e in dir_reading.flatten() {
            let p = e.path();
            if p.is_file() && p.extension().and_then(|s| s.to_str()) == Some("casi") {
                v.push(p);
            } else if p.is_dir() {
                let sub = p.join("index.casi");
                if sub.exists() {
                    v.push(sub);
                }
            }
        }
        v.sort();
        v
    };
    for p in paths {
        let f = CasiFile::open(&p).map_err(|e| format!("加载索引失败 {}: {e}", p.display()))?;
        files.push(OpenedIndex { file: f, path: p });
    }
    if files.is_empty() {
        return Err(format!("{} 下没有 .casi 索引", index.display()));
    }
    Ok(files)
}

pub fn run_match(
    sample: &Path,
    index_dir: &Path,
    from_s: f64,
    to_s: Option<f64>,
    min_aligned: Option<u32>,
    min_ratio: Option<f64>,
    top: usize,
    json_out: Option<&Path>,
) -> Result<(), String> {
    let t0 = std::time::Instant::now();
    let indexes = open_index_files(index_dir)?;
    let total_seg = indexes.len();

    let y = load_and_trim(sample, from_s, to_s)?;
    let n = casi_core::frame_count(y.len());
    let m = casi_core::dsp::stft_db(&y);
    let hs = casi_core::extract_hashes(&m, n);
    println!("样本哈希数: {}", hs.len());

    let refs: Vec<&CasiFile> = indexes.iter().map(|o| &o.file).collect();
    let occs = match_index(&refs, &hs, min_aligned, min_ratio, 2);
    let time_taken = t0.elapsed().as_secs_f64();
    println!(
        "检索完成: 载入 {total_seg} 段, 命中 {} 处, 耗时 {:.2}s",
        occs.len(),
        time_taken
    );
    println!();

    let by_fid: std::collections::HashMap<u32, (String, String, f64)> = indexes
        .iter()
        .flat_map(|o| o.file.files())
        .map(|f| (f.fid, (f.name, f.path, f.duration)))
        .collect();

    if top > 0 {
        println!("#    文件                 偏移       样本区间     命中   置信度   时长");
        println!("{}", "-".repeat(86));
        for (i, o) in occs.iter().take(top).enumerate() {
            if o.file_id == 0 {
                continue;
            }
            let (name, _, dur) = by_fid.get(&o.file_id).cloned().unwrap_or_default();
            println!(
                "{:>3}  {:<22} {:>8}  {:>8}-{:<8} {:>5} {:>7.2}% {:>8}",
                i + 1,
                name,
                fmt_sec(o.offset_file_sec()),
                fmt_sec(o.tq0 as f64 * casi_core::FRAME_SEC),
                fmt_sec(o.tq1 as f64 * casi_core::FRAME_SEC),
                o.aligned,
                o.ratio * 100.0,
                fmt_sec(dur)
            );
        }
    } else {
        println!("当前命中（所有）:");
        for (i, o) in occs.iter().enumerate() {
            if o.file_id == 0 {
                continue;
            }
            let (name, _, _) = by_fid.get(&o.file_id).cloned().unwrap_or_default();
            println!(
                "{:>3}  {:<22} 偏移 {:>8}  样本 {:>8}-{:<8}  命中 {:>5} ({:.2}%)",
                i + 1,
                name,
                fmt_sec(o.offset_file_sec()),
                fmt_sec(o.tq0 as f64 * casi_core::FRAME_SEC),
                fmt_sec(o.tq1 as f64 * casi_core::FRAME_SEC),
                o.aligned,
                o.ratio * 100.0
            );
        }
    }

    if let Some(jp) = json_out {
        let arr: Vec<serde_json::Value> = occs
            .iter()
            .map(|o| {
                let (name, path, dur) = by_fid.get(&o.file_id).cloned().unwrap_or_default();
                serde_json::json!({
                    "file_id": o.file_id,
                    "name": name,
                    "path": path,
                    "file_duration": dur,
                    "offset_file": round3(o.offset_file_sec()),
                    "span": round3(o.span_sec()),
                    "tq0": o.tq0,
                    "tq1": o.tq1,
                    "aligned": o.aligned,
                    "ratio": round3(o.ratio),
                })
            })
            .collect();
        let out = serde_json::json!({
            "hash_count": hs.len(),
            "occurrences": arr,
        });
        std::fs::write(jp, serde_json::to_string_pretty(&out).unwrap())
            .map_err(|e| format!("写 JSON 失败: {e}"))?;
        println!("\nJSON 已写入 {}", jp.display());
    }
    Ok(())
}

fn round3(v: f64) -> f64 {
    (v * 1000.0).round() / 1000.0
}

#[allow(dead_code)]
fn _fmt_occ(o: &Occurrence) -> String {
    format!("{}", o.file_id)
}

pub fn print_stats(index: &Path) -> Result<(), String> {
    let files = open_index_files(index)?;
    let total_hashes: u64 = files.iter().map(|f| f.file.hash_count()).sum();
    let total_files: u64 = files.iter().map(|f| f.file.file_count()).sum();
    println!("段数: {}", files.len());
    println!("文件数: {total_files}");
    println!("哈希数: {total_hashes}");
    for f in &files {
        let size = std::fs::metadata(&f.path).map(|m| m.len()).unwrap_or(0);
        println!(
            "  {}: {} 行 ({} MB)",
            f.path.display(),
            f.file.hash_count(),
            size / 1_048_576
        );
    }
    Ok(())
}
