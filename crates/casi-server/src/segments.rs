//! 索引段发现 / 注册表解析 / 统计。
//!
//! 兼容旧结构：
//! - base 段 = 含 .casi 的目录（顶层 *.casi 或 index.casi）
//! - 或 base 下 seg_* 子目录（每段一个 .casi 目录）
//! 与 Python list_index_segments 语义一致（shard_*.sqlite → *.casi）。

use std::path::{Path, PathBuf};
use std::sync::Arc;

use casi_index::CasiFile;

use crate::AppState;

/// 目录下是否含 .casi 文件（直接 *.casi 或子目录 index.casi）
pub fn has_casi_files(dir: &Path) -> bool {
    if !dir.is_dir() {
        return false;
    }
    if let Ok(rd) = std::fs::read_dir(dir) {
        for e in rd.flatten() {
            let p = e.path();
            if p.is_file() && p.extension().and_then(|s| s.to_str()) == Some("casi") {
                return true;
            }
            if p.is_dir() && p.join("index.casi").is_file() {
                return true;
            }
        }
    }
    false
}

/// 段内 .casi 文件列表（排序，稳定）。
pub fn casi_files_of(seg_dir: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    if let Ok(rd) = std::fs::read_dir(seg_dir) {
        for e in rd.flatten() {
            let p = e.path();
            if p.is_file() && p.extension().and_then(|s| s.to_str()) == Some("casi") {
                files.push(p);
            }
        }
    }
    if !files.is_empty() {
        files.sort();
        return files;
    }
    // 子目录式：seg_dir 下子目录各自含 .casi
    let mut nested = Vec::new();
    if let Ok(rd) = std::fs::read_dir(seg_dir) {
        for e in rd.flatten() {
            let p = e.path();
            if p.is_dir() {
                if let Ok(rd2) = std::fs::read_dir(&p) {
                    for e2 in rd2.flatten() {
                        let q = e2.path();
                        if q.is_file() && q.extension().and_then(|s| s.to_str()) == Some("casi") {
                            nested.push(q);
                        }
                    }
                }
            }
        }
    }
    nested.sort();
    nested
}

/// 列出某索引目录下的段：[(seg_dir, seg_name)]
pub fn list_segments(base: &Path) -> Vec<(PathBuf, String)> {
    let mut out = Vec::new();
    if has_casi_files(base) {
        let name = base
            .file_name()
            .and_then(|s| s.to_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| "index".into());
        out.push((base.to_path_buf(), name));
        return out;
    }
    if let Ok(rd) = std::fs::read_dir(base) {
        for e in rd.flatten() {
            let p = e.path();
            if p.is_dir() && has_casi_files(&p) {
                let name = p.file_name().and_then(|s| s.to_str()).unwrap_or("?").to_string();
                out.push((p, name));
            }
        }
    }
    out.sort_by(|a, b| a.1.cmp(&b.1));
    out
}

/// 按注册名解析索引目录；可选段名。返回 (seg_dir, seg_name)。
pub fn resolve_index(state: &AppState, name: &str, segment: Option<&str>) -> Result<(PathBuf, String), String> {
    let base = {
        let reg = state.registry.read().unwrap();
        reg.get(name)
            .and_then(|v| v.as_str())
            .map(PathBuf::from)
            .ok_or_else(|| format!("索引不存在: {name}"))?
    };
    let segs = list_segments(&base);
    if segs.is_empty() {
        return Err(format!("索引段为空: {}", base.display()));
    }
    match segment {
        Some(s) => segs
            .iter()
            .find(|(_, n)| n == s)
            .map(|(d, n)| (d.clone(), n.clone()))
            .ok_or_else(|| format!("段不存在: {s}")),
        None => Ok(segs[0].clone()),
    }
}

/// 打开一个段的所有 .casi（mmap），带 LRU 缓存。
pub fn load_segment(state: &AppState, seg_dir: &Path) -> Result<Arc<Vec<Arc<CasiFile>>>, String> {
    {
        let cache = state.index_cache.read().unwrap();
        if let Some(v) = cache.get(&seg_dir.to_string_lossy().into_owned()) {
            return Ok(v);
        }
    }
    let files = casi_files_of(seg_dir);
    if files.is_empty() {
        return Err(format!("{} 下没有 .casi 文件", seg_dir.display()));
    }
    let mut opened = Vec::new();
    for f in files {
        let c = CasiFile::open(&f).map_err(|e| format!("加载索引失败 {}: {e}", f.display()))?;
        opened.push(Arc::new(c));
    }
    let out = Arc::new(opened);
    let mut cache = state.index_cache.write().unwrap();
    cache.insert(seg_dir.to_string_lossy().into_owned(), out.clone());
    Ok(out)
}

/// 段统计（files/hashes/size）。
pub fn segment_stats(seg_dir: &Path) -> serde_json::Value {
    let mut files = 0u64;
    let mut hashes = 0u64;
    for f in casi_files_of(seg_dir) {
        if let Ok(c) = CasiFile::open(&f) {
            files += c.file_count();
            hashes += c.hash_count();
        }
    }
    let size = dir_size(seg_dir);
    serde_json::json!({ "files": files, "hashes": hashes, "size": size })
}

pub fn dir_size(dir: &Path) -> u64 {
    let mut total = 0u64;
    if let Ok(rd) = std::fs::read_dir(dir) {
        for e in rd.flatten() {
            let p = e.path();
            if p.is_file() {
                total += std::fs::metadata(&p).map(|m| m.len()).unwrap_or(0);
            } else if p.is_dir() {
                total += dir_size(&p);
            }
        }
    }
    total
}
