//! 后台构建任务（rayon 流水线 + 内存共享进度）。

use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;

use rayon::prelude::*;

use casi_core::{SR, dsp, extract_hashes, load_audio, frame_count};
use casi_index::{FileMeta, Builder, Posting};

use crate::state::AppState;

pub struct BuildJob {
    pub name: String,
    pub src_dir: PathBuf,
    pub out_dir: PathBuf,
    pub segment_size_mb: u32,
    pub threads: usize,
    pub recursive: bool,
    pub incremental: bool,
    pub started: Instant,
    pub last: Mutex<String>,
    pub processed: AtomicU64,
    pub total: AtomicU64,
    pub done: AtomicU64,
    pub failed: AtomicU64,
    pub skipped: AtomicU64,
    pub finished: AtomicU64, // 0=运行中 1=完成 2=取消
    pub cancel: AtomicU64,
    pub log: Mutex<String>,
    pub tmp_dir: Option<tempfile::TempDir>,
}

impl BuildJob {
    pub fn running(&self) -> bool {
        self.finished.load(Ordering::SeqCst) == 0 && self.cancel.load(Ordering::SeqCst) == 0
    }
}

/// 构建入口（阻塞）。返回 (ok, fail, skip)。
pub fn run_build_job(_state: Arc<AppState>, job: Arc<BuildJob>) -> (u64, u64, u64) {
    let files = scan_audio(&job.src_dir, job.recursive);
    let total = files.len();
    job.total.store(total as u64, Ordering::SeqCst);

    // 增量：已有清单
    let manifest_path = job.out_dir.join("index.json");
    let existing: std::collections::BTreeSet<String> = if job.incremental {
        std::fs::read_to_string(&manifest_path)
            .ok()
            .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
            .map(|v| {
                v.get("files")
                    .and_then(|a| a.as_array())
                    .map(|a| a.iter().filter_map(|x| x.as_str().map(|s| s.to_string())).collect())
                    .unwrap_or_default()
            })
            .unwrap_or_default()
    } else {
        Default::default()
    };
    let new_files: Vec<&PathBuf> =
        files.iter().filter(|p| !existing.contains(p.to_str().unwrap_or(""))).collect();
    job.total.store(new_files.len() as u64, Ordering::SeqCst);

    let tmp = match tempfile::Builder::new().prefix("casi_build_").tempdir() {
        Ok(t) => t,
        Err(e) => {
            job.log.lock().unwrap().push_str(&format!("临时目录创建失败: {e}\n"));
            job.finished.store(1, Ordering::SeqCst);
            return (0, 0, 0);
        }
    };
    let builder = Mutex::new(Builder::with_dir(tmp.path().to_path_buf(), 1_000_000));
    let next_fid = AtomicU64::new(0);

    // 增量：拷贝旧索引行
    let idx_path = job.out_dir.join("index.casi");
    if job.incremental && idx_path.exists() {
        if let Ok(old) = casi_index::CasiFile::open(&idx_path) {
            let mut b = builder.lock().unwrap();
            for i in 0..old.hash_count() as usize {
                let p = old.posting(i);
                b.push(Posting { h: p.h, fid: p.fid, t: p.t });
            }
            for f in old.files() {
                b.add_file(FileMeta { fid: f.fid, name: f.name, path: f.path, duration: f.duration, status: f.status });
            }
            drop(b);
            next_fid.store(old.file_count(), Ordering::SeqCst);
        }
    }

    let pool = rayon::ThreadPoolBuilder::new()
        .num_threads(job.threads.max(1))
        .build()
        .map_err(|e| {
            job.log.lock().unwrap().push_str(&format!("线程池创建失败: {e}\n"));
            e
        });
    // rayon 错误处理：build 失败则直接结束
    let pool = match pool {
        Ok(p) => p,
        Err(_) => {
            job.finished.store(1, Ordering::SeqCst);
            return (0, 0, 0);
        }
    };

    let jobref = job.clone();
    pool.install(|| {
        new_files.par_iter().for_each(|file| {
            if job.cancel.load(Ordering::SeqCst) != 0 {
                return;
            }
            let name = file.file_name().and_then(|s| s.to_str()).unwrap_or("?").to_string();
            *jobref.last.lock().unwrap() = name.clone();
            match build_one(file) {
                Ok((hs, duration)) => {
                    let fid = next_fid.fetch_add(1, Ordering::SeqCst) as u32 + 1;
                    jobref.done.fetch_add(1, Ordering::SeqCst);
                    let mut b = builder.lock().unwrap();
                    for &(h, t) in &hs {
                        b.push(Posting { h, fid, t });
                    }
                    b.add_file(FileMeta {
                        fid,
                        name,
                        path: file.to_string_lossy().into_owned(),
                        duration,
                        status: 1,
                    });
                }
                Err(e) => {
                    jobref.failed.fetch_add(1, Ordering::SeqCst);
                    let mut log = jobref.log.lock().unwrap();
                    log.push_str(&format!("FAIL {name}: {e}\n"));
                    while log.len() > 64_000 {
                        let cut = log.find("\n").map(|i| i + 1).unwrap_or(log.len());
                        log.replace_range(..cut, "");
                    }
                }
            }
            let processed =
                jobref.done.load(Ordering::SeqCst) + jobref.failed.load(Ordering::SeqCst);
            jobref.processed.store(processed, Ordering::SeqCst);
        });
    });

    if job.cancel.load(Ordering::SeqCst) != 0 {
        job.finished.store(2, Ordering::SeqCst);
        return (0, 0, 0);
    }

    let done = job.done.load(Ordering::SeqCst);
    let failed = job.failed.load(Ordering::SeqCst);

    // 完成写入
    std::fs::create_dir_all(&job.out_dir).ok();
    let finish = {
        let builder = builder.into_inner().unwrap();
        builder.finish(&idx_path)
    };
    match finish {
        Ok(n) => {
            write_manifest(&manifest_path, &files);
            let mut log = job.log.lock().unwrap();
            log.push_str(&format!(
                "完成: 成功 {done}, 失败 {failed}, 共 {n} 行哈希, 耗时 {:.1}s\n",
                job.started.elapsed().as_secs_f64()
            ));
            job.finished.store(1, Ordering::SeqCst);
            (done, failed, 0)
        }
        Err(e) => {
            let mut log = job.log.lock().unwrap();
            log.push_str(&format!("写入失败: {e}\n"));
            job.finished.store(1, Ordering::SeqCst);
            (done, failed, 0)
        }
    }
}

fn build_one(path: &std::path::Path) -> Result<(Vec<(u32, u32)>, f64), String> {
    let y = load_audio(path).map_err(|e| e.to_string())?;
    let duration = y.len() as f64 / SR as f64;
    let n = frame_count(y.len());
    let m = dsp::stft_db(&y);
    let hs = extract_hashes(&m, n);
    Ok((hs, duration))
}

fn scan_audio(dir: &std::path::Path, recursive: bool) -> Vec<PathBuf> {
    let mut out = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(d) = stack.pop() {
        let Ok(rd) = std::fs::read_dir(&d) else { continue };
        let mut entries: Vec<_> = rd.flatten().map(|e| e.path()).collect();
        entries.sort();
        for p in entries {
            if p.is_dir() {
                if recursive {
                    stack.push(p);
                }
                continue;
            }
            if let Some(ext) = p.extension().and_then(|e| e.to_str()) {
                let e = ext.to_ascii_lowercase();
                if matches!(
                    e.as_str(),
                    "wav" | "flac" | "mp3" | "ogg" | "oga" | "opus" | "aac" | "m4a" | "mp4"
                    | "wma" | "aiff" | "aif" | "mkv" | "mov" | "webm" | "avi" | "flv"
                ) {
                    out.push(p);
                }
            }
        }
    }
    out.sort();
    out
}

fn write_manifest(manifest_path: &std::path::Path, files: &[PathBuf]) {
    let manifest = serde_json::json!({
        "schema": 1,
        "version": crate::APP_VERSION,
        "files": files.iter().map(|p| p.to_string_lossy().into_owned()).collect::<Vec<_>>(),
    });
    let _ = std::fs::write(manifest_path, serde_json::to_string_pretty(&manifest).unwrap());
}
