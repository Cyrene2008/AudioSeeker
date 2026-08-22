//! build 子命令：并行提取指纹 → 流式外排写入 .casi。

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use std::time::Instant;

use casi_core::{SR, dsp, extract_hashes, load_audio, frame_count};
use casi_index::{CasiFile, FileMeta, Builder, Posting};
use rayon::prelude::*;

use crate::util::scan_audio_files;

pub fn run_build(
    src_dir: &Path,
    out: &Path,
    workers: usize,
    recursive: bool,
    incremental: bool,
    chunk_rows: usize,
    log: &mut dyn FnMut(&str),
) -> i32 {
    let t0 = Instant::now();
    let files = match scan_audio_files(src_dir, recursive) {
        Ok(f) => f,
        Err(e) => {
            log(&format!("扫描失败: {e}"));
            return 1;
        }
    };
    if files.is_empty() {
        log("未找到音频文件");
        return 0;
    }
    std::fs::create_dir_all(out).unwrap();

    let index_path = out.join("index.casi");
    let manifest_path = out.join("index.json");

    // 增量：已有清单（路径集合）
    let existing_paths: std::collections::BTreeSet<String> = if incremental {
        std::fs::read_to_string(&manifest_path)
            .ok()
            .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
            .map(|v| {
                v.get("files")
                    .and_then(|a| a.as_array())
                    .map(|a| {
                        a.iter().filter_map(|x| x.as_str().map(|s| s.to_string())).collect()
                    })
                    .unwrap_or_default()
            })
            .unwrap_or_default()
    } else {
        Default::default()
    };

    let new_files: Vec<&PathBuf> = files
        .iter()
        .filter(|p| !existing_paths.contains(p.to_str().unwrap_or("")))
        .collect();

    let tmp_dir = tempfile::Builder::new().prefix("casi_build_").tempdir().unwrap();
    let builder = Mutex::new(Builder::with_dir(tmp_dir.path().to_path_buf(), chunk_rows));
    let next_fid = AtomicU64::new(0);

    // 阶段0（incremental）：流式拷贝旧索引行
    if incremental && index_path.exists() {
        match CasiFile::open(&index_path) {
            Ok(old) => {
                let mut b = builder.lock().unwrap();
                for i in 0..old.hash_count() as usize {
                    let p = old.posting(i);
                    b.push(Posting { h: p.h, fid: p.fid, t: p.t });
                }
                for f in old.files() {
                    b.add_file(FileMeta {
                        fid: f.fid,
                        name: f.name,
                        path: f.path,
                        duration: f.duration,
                        status: f.status,
                    });
                }
                drop(b);
                next_fid.store(old.file_count(), Ordering::SeqCst);
            }
            Err(e) => {
                log(&format!("警告: 旧索引不可用（{e}），将全量重建"));
            }
        }
    }

    if new_files.is_empty() {
        log("全部文件已在索引中（incremental）");
        return 0;
    }
    log(&format!(
        "共 {} 个文件, 本次新增 {}, 线程 {}",
        files.len(),
        new_files.len(),
        if workers == 0 { "auto".into() } else { workers.to_string() }
    ));

    // 阶段1：并行提取 + 流式入 builder（chunk 外排，内存有界）
    let ok = AtomicU64::new(0);
    let fail = AtomicU64::new(0);
    let pool = rayon::ThreadPoolBuilder::new()
        .num_threads(if workers == 0 { rayon::current_num_threads().max(1) } else { workers })
        .build()
        .unwrap();
    pool.install(|| {
        new_files.par_iter().for_each(|file| {
            let name = file.file_name().and_then(|s| s.to_str()).unwrap_or("?").to_string();
            match build_one(file) {
                Ok((hs, duration)) => {
                    let fid = next_fid.fetch_add(1, Ordering::SeqCst) as u32 + 1;
                    ok.fetch_add(1, Ordering::SeqCst);
                    let mut b = builder.lock().unwrap();
                    for &(h, t) in &hs {
                        b.push(Posting { h, fid, t });
                    }
                    b.add_file(FileMeta {
                        fid,
                        name: name.clone(),
                        path: file.to_string_lossy().into_owned(),
                        duration,
                        status: 1,
                    });
                    let processed = ok.load(Ordering::SeqCst) + fail.load(Ordering::SeqCst);
                    if processed % 100 == 0 {
                        log_dbg(format!("  [{processed}/{}] {name}", new_files.len()));
                    }
                }
                Err(e) => {
                    fail.fetch_add(1, Ordering::SeqCst);
                    log_dbg(format!("  FAIL {name}: {e}"));
                }
            }
        });
    });
    let ok_n = ok.load(Ordering::SeqCst);
    let fail_n = fail.load(Ordering::SeqCst);

    // 阶段2：完成写入
    let builder = builder.into_inner().unwrap();
    match builder.finish(&index_path) {
        Ok(n) => {
            write_manifest(&manifest_path, &files);
            log(&format!(
                "完成: 成功 {}, 失败 {fail_n}, 共 {n} 行哈希, 文件 {} 个, 耗时 {:.1}s",
                ok_n, files.len(), t0.elapsed().as_secs_f64()
            ));
            0
        }
        Err(e) => {
            log(&format!("写入索引失败: {e}"));
            1
        }
    }
}

fn log_dbg(_s: String) {}

fn build_one(path: &Path) -> Result<(Vec<(u32, u32)>, f64), String> {
    let y = load_audio(path).map_err(|e| e.to_string())?;
    let duration = y.len() as f64 / SR as f64;
    let n = frame_count(y.len());
    let m = dsp::stft_db(&y);
    let hs = extract_hashes(&m, n);
    Ok((hs, duration))
}

fn write_manifest(manifest_path: &Path, files: &[PathBuf]) {
    let manifest = serde_json::json!({
        "schema": 1,
        "version": env!("CARGO_PKG_VERSION"),
        "files": files.iter().map(|p| p.to_string_lossy().into_owned()).collect::<Vec<_>>(),
    });
    let _ = std::fs::write(manifest_path, serde_json::to_string_pretty(&manifest).unwrap());
}
