//! 应用逻辑层（纯函数，无 HTTP 依赖）。
//!
//! Tauri command 入口与 axum 路由入口共同调用本层，保证行为一致。
//! 所有函数签名：Result<Value, ApiError>。

use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;

use serde::Deserialize;
use serde_json::{json, Value};

use casi_search::{match_index, Occurrence};

use crate::state::AppState;
use crate::{build, segments};

#[derive(Debug, Clone)]
pub struct ApiError {
    pub status: u16,
    pub detail: String,
}

impl ApiError {
    pub fn bad(detail: impl Into<String>) -> Self {
        ApiError { status: 400, detail: detail.into() }
    }
    pub fn not_found(detail: impl Into<String>) -> Self {
        ApiError { status: 404, detail: detail.into() }
    }
    pub fn inner(detail: impl Into<String>) -> Self {
        ApiError { status: 500, detail: detail.into() }
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.detail)
    }
}

pub type ApiResult = Result<Value, ApiError>;

// ---------- 基础 ----------

pub fn health(_state: &AppState) -> ApiResult {
    Ok(json!({ "ok": true, "version": crate::APP_VERSION }))
}

pub fn get_settings(state: &AppState) -> ApiResult {
    let mut s = state.settings_value();
    s["data_dir"] = json!(state.data_dir().to_string_lossy());
    s["app_dir"] = json!(state.app_dir.to_string_lossy());
    Ok(s)
}

/// 合并式更新设置（与旧版语义一致）。
pub fn put_settings(state: &AppState, patch: &Value) -> ApiResult {
    let mut s = state.settings_value();
    if let (Some(dst), Some(src)) = (s.as_object_mut(), patch.as_object()) {
        for (k, v) in src {
            if v.is_null() {
                dst.remove(k);
            } else {
                dst.insert(k.clone(), v.clone());
            }
        }
    }
    state.save_settings(&s);
    Ok(s)
}

// ---------- 索引管理 ----------

pub fn list_indexes(state: &AppState, include_stats: bool) -> ApiResult {
    let reg = state.registry.read().unwrap().clone();
    let mut out = Vec::new();
    if let Some(map) = reg.as_object() {
        for (name, v) in map.iter() {
            let base = v.as_str().unwrap_or_default().to_string();
            let base_path = PathBuf::from(&base);
            let segs = segments::list_segments(&base_path);
            let mut seg_info = Vec::new();
            for (seg, sn) in &segs {
                let mut seg_json = if include_stats {
                    segments::segment_stats(seg)
                } else {
                    json!({ "files": Value::Null, "hashes": Value::Null, "size": Value::Null })
                };
                seg_json["name"] = json!(sn);
                seg_info.push(seg_json);
            }
            let total_hashes: u64 = if include_stats {
                seg_info.iter().map(|s| s["hashes"].as_i64().unwrap_or(0).max(0) as u64).sum()
            } else {
                0
            };
            let segment_size_mb = index_metadata(&base_path).map(|i| json!(i)).unwrap_or(Value::Null);
            out.push(json!({
                "name": name,
                "path": base,
                "segments": seg_info,
                "segment_size_mb": segment_size_mb,
                "total_hashes": if include_stats { json!(total_hashes) } else { Value::Null },
            }));
        }
    }
    Ok(json!(out))
}

fn index_metadata(base: &std::path::Path) -> Option<i64> {
    let data = std::fs::read_to_string(base.join("index_meta.json")).ok()?;
    let v: Value = serde_json::from_str(&data).ok()?;
    v.get("segment_size_mb")?.as_i64()
}

pub fn import_index(state: &AppState, name: &str, path: &str) -> ApiResult {
    let p = std::fs::canonicalize(path).unwrap_or(PathBuf::from(path));
    if !p.is_dir() {
        return Err(ApiError::bad("目录不存在"));
    }
    if !segments::has_casi_files(&p) {
        return Err(ApiError::bad("该目录下没有 .casi 索引，不是有效索引"));
    }
    {
        let mut reg = state.registry.write().unwrap();
        if let Some(old) = reg.get(name) {
            if old.as_str() != Some(path) {
                return Err(ApiError::bad(format!("索引名已存在: {name}")));
            }
        }
        if let Some(o) = reg.as_object_mut() {
            o.insert(name.to_string(), json!(path));
        }
        state.save_registry(&reg);
    }
    Ok(json!({ "ok": true, "name": name, "path": p.to_string_lossy() }))
}

pub fn delete_index(state: &AppState, name: &str, delete_files: bool) -> ApiResult {
    let base = {
        let reg = state.registry.read().unwrap().clone();
        match reg.get(name).and_then(|v| v.as_str()) {
            Some(b) => PathBuf::from(b),
            None => return Err(ApiError::not_found(format!("索引不存在: {name}"))),
        }
    };
    let default_root = std::fs::canonicalize(
        state.settings_value().get("default_index_dir").and_then(|v| v.as_str()).map(PathBuf::from).unwrap_or_default(),
    )
    .unwrap_or_default();
    let abs_base = std::fs::canonicalize(&base).unwrap_or(base.clone());
    if delete_files && abs_base.is_dir() && !abs_base.starts_with(&default_root) {
        return Err(ApiError::bad("索引不在默认索引目录内，为安全起见未删除文件"));
    }
    {
        let mut reg = state.registry.write().unwrap();
        if let Some(o) = reg.as_object_mut() {
            o.remove(name);
        }
        state.save_registry(&reg);
    }
    state.index_cache.write().unwrap().remove_prefix(&base);
    if delete_files && abs_base.is_dir() {
        let _ = std::fs::remove_dir_all(&abs_base);
    }
    Ok(json!({ "ok": true }))
}

// ---------- 构建 ----------

#[derive(Deserialize, Default, Clone)]
pub struct BuildStartModel {
    pub name: String,
    pub src_dir: String,
    #[serde(default = "default_threads")]
    pub threads: usize,
    #[serde(default)]
    pub segment_size_mb: u32,
    #[serde(default)]
    pub recursive: bool,
    #[serde(default)]
    pub incremental: bool,
}

fn default_threads() -> usize {
    8
}

pub fn build_start(state: Arc<AppState>, m: BuildStartModel) -> ApiResult {
    {
        let guard = state.build_job.lock().unwrap();
        if let Some(job) = guard.as_ref() {
            if job.running() {
                return Err(ApiError::bad("已有构建任务进行中"));
            }
        }
    }
    let src = std::fs::canonicalize(&m.src_dir).unwrap_or(PathBuf::from(&m.src_dir));
    if !src.is_dir() {
        return Err(ApiError::bad("音频目录不存在"));
    }
    let out_dir = {
        let reg = state.registry.read().unwrap().clone();
        if m.incremental {
            match reg.get(&m.name).and_then(|v| v.as_str()) {
                Some(base) => PathBuf::from(base),
                None => return Err(ApiError::not_found(format!("索引不存在: {}", m.name))),
            }
        } else {
            let default_root = state
                .settings_value()
                .get("default_index_dir")
                .and_then(|v| v.as_str())
                .map(PathBuf::from)
                .unwrap_or_else(|| state.app_dir.join("index"));
            default_root.join(&m.name)
        }
    };
    std::fs::create_dir_all(&out_dir).map_err(|e| ApiError::bad(format!("创建索引目录失败: {e}")))?;
    state.index_cache.write().unwrap().remove_prefix(&out_dir);
    {
        let mut reg = state.registry.write().unwrap();
        let exists = reg.get(&m.name).and_then(|v| v.as_str()) == Some(out_dir.to_str().unwrap_or(""));
        if let Some(o) = reg.as_object_mut() {
            o.insert(m.name.clone(), json!(out_dir.to_string_lossy()));
        }
        if !exists {
            state.save_registry(&reg);
        }
    }

    let job = Arc::new(build::BuildJob {
        name: m.name.clone(),
        src_dir: src.clone(),
        out_dir: out_dir.clone(),
        segment_size_mb: m.segment_size_mb,
        threads: m.threads.max(1),
        recursive: m.recursive,
        incremental: m.incremental,
        started: Instant::now(),
        last: std::sync::Mutex::new(String::new()),
        processed: AtomicU64::new(0),
        total: AtomicU64::new(0),
        done: AtomicU64::new(0),
        failed: AtomicU64::new(0),
        skipped: AtomicU64::new(0),
        finished: AtomicU64::new(0),
        cancel: AtomicU64::new(0),
        log: std::sync::Mutex::new(String::new()),
        tmp_dir: None,
    });
    {
        let mut guard = state.build_job.lock().unwrap();
        *guard = Some(job.clone());
    }
    let st = state.clone();
    std::thread::Builder::new().name("casi-build".into()).spawn(move || {
        build::run_build_job(st, job);
    }).ok();
    Ok(json!({ "ok": true, "name": m.name }))
}

pub fn build_status(state: &AppState) -> ApiResult {
    let guard = state.build_job.lock().unwrap();
    let Some(job) = guard.as_ref() else {
        return Ok(json!({ "running": false }));
    };
    let running = job.running();
    let log = job.log.lock().unwrap().clone();
    let last = job.last.lock().unwrap().clone();
    Ok(json!({
        "running": running,
        "name": job.name,
        "src_dir": job.src_dir.to_string_lossy(),
        "out_dir": job.out_dir.to_string_lossy(),
        "threads": job.threads,
        "segment_size_mb": job.segment_size_mb,
        "last": last,
        "processed": job.processed.load(Ordering::SeqCst),
        "total": job.total.load(Ordering::SeqCst),
        "done": job.done.load(Ordering::SeqCst),
        "failed": job.failed.load(Ordering::SeqCst),
        "skipped": job.skipped.load(Ordering::SeqCst),
        "elapsed": job.started.elapsed().as_secs_f64().round(),
        "log": log,
    }))
}

pub fn build_cancel(state: &AppState) -> ApiResult {
    let guard = state.build_job.lock().unwrap();
    if let Some(job) = guard.as_ref() {
        if job.running() {
            job.cancel.store(1, Ordering::SeqCst);
            return Ok(json!({ "ok": true }));
        }
    }
    Ok(json!({ "ok": false, "detail": "无进行中的任务" }))
}

// ---------- 错误日志 ----------

#[derive(Deserialize, Default)]
pub struct ErrorLogModel {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub location: String,
    #[serde(default)]
    pub stack: String,
}

pub fn log_error(state: &AppState, m: ErrorLogModel) -> ApiResult {
    let line = format!(
        "[{}] {}\n{}\n---\n",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
        m.location,
        format!("{}\n{}", m.message, m.stack)
    );
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(state.data_dir().join("error.log"))
    {
        use std::io::Write;
        let _ = f.write_all(line.as_bytes());
    }
    Ok(json!({ "ok": true }))
}

// ---------- 检索历史 ----------

pub fn list_history(state: &AppState) -> ApiResult {
    Ok(state.history.read().unwrap().clone())
}

pub fn get_history(state: &AppState, hid: &str) -> ApiResult {
    let path = state.data_dir().join("history").join(format!("{hid}.json"));
    match std::fs::read_to_string(&path) {
        Ok(s) => serde_json::from_str::<Value>(&s).map_err(|_| ApiError::not_found("历史记录不存在")),
        Err(_) => Err(ApiError::not_found("历史记录不存在")),
    }
}

pub fn delete_history(state: &AppState, hid: &str) -> ApiResult {
    {
        let mut h = state.history.read().unwrap().clone();
        if let Some(arr) = h.as_array_mut() {
            arr.retain(|x| x.get("id").and_then(|v| v.as_str()) != Some(hid));
        }
        state.save_history(&h);
    }
    let _ = std::fs::remove_file(state.data_dir().join("history").join(format!("{hid}.json")));
    Ok(json!({ "ok": true }))
}

pub fn add_history(state: &AppState, meta: Value, occurrences: &[Value]) {
    let hid = uuid::Uuid::new_v4().simple().to_string();
    let dir = state.data_dir().join("history");
    std::fs::create_dir_all(&dir).ok();
    let mut record = meta.clone();
    record["id"] = json!(hid);
    record["occurrences"] = json!(occurrences);
    let _ = std::fs::write(dir.join(format!("{hid}.json")), serde_json::to_string(&record).unwrap());
    let h = state.history.read().unwrap().clone();
    let entry = json!({
        "id": hid,
        "time": meta.get("time").cloned().unwrap_or(json!("")),
        "index_name": meta.get("index_name").cloned().unwrap_or(json!("")),
        "segment": meta.get("segment").cloned().unwrap_or(Value::Null),
        "sample": meta.get("sample").cloned().unwrap_or(json!("")),
        "hash_count": meta.get("hash_count").cloned().unwrap_or(json!(0)),
        "count": occurrences.len(),
    });
    let mut arr = h.as_array().map(|a| a.clone()).unwrap_or_default();
    arr.insert(0, entry);
    while arr.len() > 50 {
        let removed = arr.pop().unwrap();
        if let Some(hid) = removed.get("id").and_then(|v| v.as_str()) {
            let _ = std::fs::remove_file(dir.join(format!("{hid}.json")));
        }
    }
    state.save_history(&json!(arr));
}

// ---------- 匹配 ----------

#[derive(Deserialize, Default, Clone)]
pub struct MatchModel {
    pub index_name: String,
    pub segment: Option<String>,
    pub sample: String,
    pub from_s: Option<f64>,
    pub to_s: Option<f64>,
    pub min_aligned: Option<u32>,
    pub min_ratio: Option<f64>,
}

pub fn run_match(state: &AppState, m: MatchModel) -> ApiResult {
    let (seg_dir, seg_name) = segments::resolve_index(state, &m.index_name, m.segment.as_deref())
        .map_err(ApiError::not_found)?;
    let sample_path = PathBuf::from(&m.sample);
    if !sample_path.is_file() {
        return Err(ApiError::bad("样本文件不存在"));
    }
    let indexes = segments::load_segment(state, &seg_dir).map_err(ApiError::inner)?;

    let t0 = Instant::now();
    let y = casi_core::load_audio(&sample_path)
        .map_err(|e| ApiError::inner(format!("样本解码失败: {e}")))?;
    let y_trimmed = match (m.from_s.unwrap_or(0.0), m.to_s) {
        (f, Some(t)) => {
            let a = (f * casi_core::SR as f64) as usize;
            let b = (t * casi_core::SR as f64) as usize;
            y.get(a.min(y.len())..b.min(y.len())).unwrap_or(&[]).to_vec()
        }
        (0.0, None) => y,
        (f, None) => {
            let a = (f * casi_core::SR as f64) as usize;
            y.get(a.min(y.len())..).unwrap_or(&[]).to_vec()
        }
    };
    if y_trimmed.is_empty() {
        return Err(ApiError::bad("样本切片为空"));
    }
    let n_frames = casi_core::frame_count(y_trimmed.len());
    let m_mat = casi_core::dsp::stft_db(&y_trimmed);
    let hs = casi_core::extract_hashes(&m_mat, n_frames);
    let refs: Vec<&casi_index::CasiFile> = indexes.iter().map(|c| c.as_ref()).collect();
    let occs = match_index(&refs, &hs, m.min_aligned, m.min_ratio, 2);
    let _dur_ms = t0.elapsed().as_millis();

    let mut by_id = std::collections::HashMap::new();
    for c in indexes.iter() {
        for f in c.files() {
            by_id.insert(f.fid, (f.name, f.path, f.duration));
        }
    }
    let mut enriched = Vec::new();
    for o in &occs {
        if let Some((name, path, dur)) = by_id.get(&o.file_id) {
            enriched.push(occurrence_json(o, name, path, *dur));
        }
    }
    // 前端渲染限制：保留 top 500（避免 IPC 载荷过大导致 WebView crash）
    const MAX_DISPLAY: usize = 500;
    let display_count = enriched.len();
    enriched.truncate(MAX_DISPLAY);

    add_history(
        state,
        json!({
            "time": chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
            "index_name": m.index_name,
            "segment": seg_name,
            "sample": m.sample,
            "hash_count": hs.len(),
        }),
        &enriched,
    );
    if state.settings_value().get("unload_index_after_search").and_then(|v| v.as_bool()).unwrap_or(false) {
        state.index_cache.write().unwrap().remove(&seg_dir.to_string_lossy().into_owned());
    }
    Ok(json!({
        "segment": seg_name,
        "index_name": m.index_name,
        "hash_count": hs.len(),
        "occurrences": enriched,
    }))
}

fn occurrence_json(o: &Occurrence, name: &str, path: &str, dur: f64) -> Value {
    json!({
        "file_id": o.file_id,
        "name": name,
        "path": path,
        "file_duration": (dur * 1000.0).round() / 1000.0,
        "offset_file": (o.offset_file_sec() * 1000.0).round() / 1000.0,
        "span": (o.span_sec() * 1000.0).round() / 1000.0,
        "tq0": o.tq0,
        "tq1": o.tq1,
        "aligned": o.aligned,
        "ratio": o.ratio.min(1.0),
    })
}

// ---------- 导出（按索引复制源文件） ----------

#[derive(Deserialize, Default)]
pub struct ExportOccurrence {
    pub file_id: Option<i64>,
    pub path: Option<String>,
    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Deserialize, Default)]
pub struct ExportModel {
    #[serde(default)]
    pub index_name: String,
    #[serde(default)]
    pub segment: Option<String>,
    pub out_dir: String,
    pub occurrences: Vec<ExportOccurrence>,
}

pub fn export_files(state: &AppState, m: ExportModel) -> ApiResult {
    let out_dir = PathBuf::from(&m.out_dir);
    std::fs::create_dir_all(&out_dir).map_err(|e| ApiError::bad(format!("目标目录创建失败: {e}")))?;

    let mut files_to_copy: Vec<PathBuf> = Vec::new();
    for o in &m.occurrences {
        if let Some(p) = &o.path {
            files_to_copy.push(PathBuf::from(p));
            continue;
        }
        if o.file_id.map(|id| id > 0).unwrap_or(false) {
            let (seg_dir, _) = segments::resolve_index(state, &m.index_name, m.segment.as_deref())
                .map_err(ApiError::not_found)?;
            let mut found = None;
            for c in &*segments::load_segment(state, &seg_dir).map_err(ApiError::inner)? {
                for f in c.files() {
                    if f.fid as i64 == o.file_id.unwrap() {
                        found = Some(PathBuf::from(f.path));
                        break;
                    }
                }
                if found.is_some() {
                    break;
                }
            }
            if let Some(p) = found {
                files_to_copy.push(p);
            }
        }
    }
    if files_to_copy.is_empty() {
        return Err(ApiError::bad("没有可导出的文件"));
    }

    let mut copied = Vec::new();
    for src in files_to_copy {
        if !src.is_file() {
            return Err(ApiError::inner(format!("源文件不存在: {}", src.display())));
        }
        let base = src.file_name().map(|s| s.to_string_lossy().into_owned()).unwrap_or_else(|| "audio".into());
        let mut target = out_dir.join(&base);
        let mut n = 1;
        while target.exists() {
            let stem = std::path::Path::new(&base).file_stem().and_then(|s| s.to_str()).unwrap_or("audio");
            let ext = std::path::Path::new(&base).extension().and_then(|s| s.to_str()).map(|s| format!(".{s}")).unwrap_or_default();
            target = out_dir.join(format!("{stem}_{n}{ext}"));
            n += 1;
        }
        match std::fs::copy(&src, &target) {
            Ok(size) => copied.push(json!({
                "name": target.file_name().and_then(|s| s.to_str()).unwrap_or(""),
                "path": target.to_string_lossy(),
                "size": size,
                "source": src.to_string_lossy(),
            })),
            Err(e) => return Err(ApiError::inner(format!("复制失败 {}: {e}", src.display()))),
        }
    }
    Ok(json!({
        "ok": true,
        "out_dir": out_dir.to_string_lossy(),
        "count": copied.len(),
        "files": copied,
    }))
}

// ---------- 收藏 ----------

#[derive(Deserialize, Default)]
pub struct FavoriteModel {
    pub name: String,
    pub path: String,
    pub index_name: String,
    pub offset: f64,
    pub span: f64,
    #[serde(default)]
    pub aligned: u32,
    #[serde(default)]
    pub ratio: f64,
}

pub fn get_favorites(state: &AppState) -> ApiResult {
    Ok(state.favorites.read().unwrap().clone())
}

pub fn add_favorite(state: &AppState, m: FavoriteModel) -> ApiResult {
    let fid = uuid::Uuid::new_v4().simple().to_string();
    let fs = state.favorites.read().unwrap().clone();
    let mut arr = fs.as_array().map(|a| a.clone()).unwrap_or_default();
    arr.push(json!({
        "id": fid,
        "name": m.name,
        "path": m.path,
        "index_name": m.index_name,
        "offset": m.offset,
        "span": m.span,
        "aligned": m.aligned,
        "ratio": m.ratio,
        "added_at": chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
    }));
    state.save_favorites(&json!(arr));
    Ok(json!({ "ok": true, "id": fid }))
}

pub fn delete_favorite(state: &AppState, fid: &str) -> ApiResult {
    let mut fs = state.favorites.read().unwrap().clone();
    if let Some(arr) = fs.as_array_mut() {
        arr.retain(|x| x.get("id").and_then(|v| v.as_str()) != Some(fid));
    }
    state.save_favorites(&fs);
    Ok(json!({ "ok": true }))
}
