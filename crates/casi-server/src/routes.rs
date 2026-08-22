//! 路由薄壳：仅做 axum 适配（JSON 抽取 → api.rs 纯函数 → HTTP 响应）。
//!
//! 逻辑全部位于 api.rs（与 Tauri command 共享）。

use std::sync::Arc;

use axum::extract::{Path as AxPath, Query, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use serde::Deserialize;
use serde_json::Value;

use crate::api::{self, ApiError};
use crate::state::{AppState, PORT};

type JsonResult = Result<Json<Value>, (StatusCode, Json<Value>)>;
type HResult = JsonResult;

fn map_err(e: ApiError) -> (StatusCode, Json<Value>) {
    (
        StatusCode::from_u16(e.status).unwrap_or(StatusCode::BAD_REQUEST),
        Json(serde_json::json!({ "detail": e.detail })),
    )
}

pub fn router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/health", get(health))
        .route("/api/version", get(version))
        .route("/api/settings", get(settings_get).put(settings_put))
        .route("/api/indexes", get(indexes_list))
        .route("/api/indexes/import", post(indexes_import))
        .route("/api/indexes/{name}", delete(indexes_delete))
        .route("/api/build/start", post(build_start))
        .route("/api/build/status", get(build_status))
        .route("/api/build/cancel", post(build_cancel))
        .route("/api/error-log", post(error_log))
        .route("/api/history", get(history_list))
        .route("/api/history/{hid}", get(history_get).delete(history_delete))
        .route("/api/match", post(do_match))
        .route("/api/audio", get(audio))
        .route("/api/export", post(do_export))
        .route("/api/favorites", get(favorites_get).post(favorites_add))
        .route("/api/favorites/{fid}", delete(favorites_delete))
        .layer(tower_http::cors::CorsLayer::permissive())
        .with_state(state)
}

// ---------- 基础 ----------

async fn health(State(state): State<Arc<AppState>>) -> HResult {
    let mut v = api::health(&state).map_err(map_err)?;
    v["port"] = serde_json::json!(PORT);
    Ok(Json(v))
}
async fn version() -> Json<Value> {
    Json(serde_json::json!({ "version": crate::APP_VERSION }))
}

#[derive(Deserialize)]
pub struct SettingsModel {
    pub default_index_dir: Option<String>,
    pub lang: Option<String>,
    pub dark: Option<bool>,
    pub theme: Option<String>,
    pub unload_index_after_search: Option<bool>,
}

async fn settings_get(State(state): State<Arc<AppState>>) -> HResult {
    Ok(Json(api::get_settings(&state).map_err(map_err)?))
}

async fn settings_put(State(state): State<Arc<AppState>>, Json(m): Json<SettingsModel>) -> HResult {
    let mut patch = serde_json::Map::new();
    if let Some(v) = m.default_index_dir {
        patch.insert("default_index_dir".into(), Value::String(v));
    }
    if let Some(v) = m.lang {
        patch.insert("lang".into(), Value::String(v));
    }
    if let Some(v) = m.dark {
        patch.insert("dark".into(), Value::Bool(v));
    }
    if let Some(v) = m.theme {
        patch.insert("theme".into(), Value::String(v));
    }
    if let Some(v) = m.unload_index_after_search {
        patch.insert("unload_index_after_search".into(), Value::Bool(v));
    }
    Ok(Json(api::put_settings(&state, &Value::Object(patch)).map_err(map_err)?))
}

// ---------- 索引管理 ----------

async fn indexes_list(
    State(state): State<Arc<AppState>>,
    Query(q): Query<Value>,
) -> HResult {
    let include_stats = q.get("include_stats").and_then(|v| v.as_str()).map(|s| s != "false").unwrap_or(true);
    Ok(Json(api::list_indexes(&state, include_stats).map_err(map_err)?))
}

#[derive(Deserialize)]
struct ImportModel {
    name: String,
    path: String,
}

async fn indexes_import(State(state): State<Arc<AppState>>, Json(m): Json<ImportModel>) -> HResult {
    Ok(Json(api::import_index(&state, &m.name, &m.path).map_err(map_err)?))
}

async fn indexes_delete(
    State(state): State<Arc<AppState>>,
    AxPath(name): AxPath<String>,
    Query(q): Query<Value>,
) -> HResult {
    let delete_files = q.get("delete_files").and_then(|v| v.as_str()).map(|s| s == "true").unwrap_or(false);
    Ok(Json(api::delete_index(&state, &name, delete_files).map_err(map_err)?))
}

// ---------- 构建 ----------

async fn build_start(State(state): State<Arc<AppState>>, Json(m): Json<api::BuildStartModel>) -> HResult {
    Ok(Json(api::build_start(state.clone(), m).map_err(map_err)?))
}

async fn build_status(State(state): State<Arc<AppState>>) -> HResult {
    Ok(Json(api::build_status(&state).map_err(map_err)?))
}

async fn build_cancel(State(state): State<Arc<AppState>>) -> HResult {
    Ok(Json(api::build_cancel(&state).map_err(map_err)?))
}

// ---------- 错误日志 ----------

async fn error_log(State(state): State<Arc<AppState>>, Json(m): Json<api::ErrorLogModel>) -> HResult {
    Ok(Json(api::log_error(&state, m).map_err(map_err)?))
}

// ---------- 历史 ----------

async fn history_list(State(state): State<Arc<AppState>>) -> HResult {
    Ok(Json(api::list_history(&state).map_err(map_err)?))
}

async fn history_get(State(state): State<Arc<AppState>>, AxPath(hid): AxPath<String>) -> HResult {
    Ok(Json(api::get_history(&state, &hid).map_err(map_err)?))
}

async fn history_delete(State(state): State<Arc<AppState>>, AxPath(hid): AxPath<String>) -> HResult {
    Ok(Json(api::delete_history(&state, &hid).map_err(map_err)?))
}

// ---------- 匹配 ----------

async fn do_match(State(state): State<Arc<AppState>>, Json(m): Json<api::MatchModel>) -> HResult {
    Ok(Json(api::run_match(&state, m).map_err(map_err)?))
}

// ---------- 音频 ----------

#[derive(Deserialize)]
struct AudioQuery {
    path: String,
    offset: Option<f64>,
    duration: Option<f64>,
}

async fn audio(Query(q): Query<AudioQuery>, headers: HeaderMap) -> Result<axum::response::Response, (StatusCode, Json<Value>)> {
    let p = std::path::PathBuf::from(&q.path);
    if !p.is_file() {
        return Err(map_err(ApiError::not_found("文件不存在")));
    }
    let _ = (q.offset, q.duration);
    let data = match std::fs::read(&p) {
        Ok(d) => d,
        Err(e) => return Err(map_err(ApiError::inner(format!("{e}")))),
    };
    let mime = ext_mime(&p);
    if let Some(range) = headers.get(header::RANGE).and_then(|v| v.to_str().ok()) {
        if let Some((start, end)) = parse_range(range, data.len() as u64) {
            let start = start as usize;
            let end = (end as usize).min(data.len() - 1);
            let slice = &data[start..=end];
            return axum::response::Response::builder()
                .status(StatusCode::PARTIAL_CONTENT)
                .header(header::CONTENT_TYPE, mime)
                .header(header::ACCEPT_RANGES, "bytes")
                .header(header::CONTENT_RANGE, format!("bytes {start}-{end}/{}", data.len()))
                .header(header::CONTENT_LENGTH, slice.len())
                .body(axum::body::Body::from(slice.to_vec()))
                .map_err(|e| map_err(ApiError::inner(format!("{e}"))));
        }
    }
    axum::response::Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime)
        .header(header::ACCEPT_RANGES, "bytes")
        .header(header::CONTENT_LENGTH, data.len())
        .body(axum::body::Body::from(data))
        .map_err(|e| map_err(ApiError::inner(format!("{e}"))))
}

fn parse_range(range: &str, len: u64) -> Option<(u64, u64)> {
    let r = range.strip_prefix("bytes=")?;
    let (a, b) = r.split_once('-')?;
    let a = a.trim();
    let b = b.trim();
    if b.is_empty() {
        let start: u64 = a.parse().ok()?;
        if start >= len {
            return None;
        }
        return Some((start, len - 1));
    }
    if a.is_empty() {
        let suffix: u64 = b.parse().ok()?;
        if suffix == 0 {
            return None;
        }
        let start = len.saturating_sub(suffix);
        return Some((start, len - 1));
    }
    let start: u64 = a.parse().ok()?;
    let end: u64 = b.parse().ok()?;
    let end = end.min(len - 1);
    if start > end || start >= len {
        return None;
    }
    Some((start, end))
}

fn ext_mime(p: &std::path::Path) -> &'static str {
    match p.extension().and_then(|e| e.to_str()).unwrap_or("").to_ascii_lowercase().as_str() {
        "wav" => "audio/wav",
        "flac" => "audio/flac",
        "mp3" => "audio/mpeg",
        "ogg" | "oga" => "audio/ogg",
        "opus" => "audio/opus",
        "m4a" => "audio/mp4",
        "aac" => "audio/aac",
        "aiff" | "aif" => "audio/aiff",
        "wma" => "audio/x-ms-wma",
        _ => "application/octet-stream",
    }
}

// ---------- 导出 ----------

async fn do_export(State(state): State<Arc<AppState>>, Json(m): Json<api::ExportModel>) -> HResult {
    Ok(Json(api::export_files(&state, m).map_err(map_err)?))
}

// ---------- 收藏 ----------

async fn favorites_get(State(state): State<Arc<AppState>>) -> HResult {
    Ok(Json(api::get_favorites(&state).map_err(map_err)?))
}

async fn favorites_add(State(state): State<Arc<AppState>>, Json(m): Json<api::FavoriteModel>) -> HResult {
    Ok(Json(api::add_favorite(&state, m).map_err(map_err)?))
}

async fn favorites_delete(State(state): State<Arc<AppState>>, AxPath(fid): AxPath<String>) -> HResult {
    Ok(Json(api::delete_favorite(&state, &fid).map_err(map_err)?))
}
