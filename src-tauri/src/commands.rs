//! Tauri command 层：前端 invoke 直通 casi-server 逻辑（无 HTTP）。
//!
//! 与 casi-server 的 axum 路由共用 api.rs 纯函数层，行为一致。

use std::sync::{Arc, OnceLock};

use casi_server::api::{self, ApiError};
use casi_server::AppState;
use serde_json::Value;

static STATE: OnceLock<Arc<AppState>> = OnceLock::new();

/// 初始化（Tauri setup 时调用一次）。
pub fn init_app(data_dir: std::path::PathBuf, app_dir: std::path::PathBuf) -> Arc<AppState> {
    let s = AppState::new(data_dir, app_dir);
    let _ = STATE.set(s.clone());
    s
}

fn app() -> Arc<AppState> {
    STATE.get().expect("AppState not initialized").clone()
}

/// 在 blocking 线程池执行逻辑（避免阻塞 IPC worker）。
async fn run<F>(f: F) -> Result<Value, String>
where
    F: FnOnce(&AppState) -> Result<Value, ApiError> + Send + 'static,
{
    let state = app();
    tauri::async_runtime::spawn_blocking(move || f(&state).map_err(|e| e.detail))
        .await
        .map_err(|e| e.to_string())?
}

pub fn parse<T: serde::de::DeserializeOwned>(payload: Value) -> Result<T, String> {
    serde_json::from_value(payload).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn casi_match(payload: Value) -> Result<Value, String> {
    let m: api::MatchModel = parse(payload)?;
    run(move |s| api::run_match(s, m)).await
}

#[tauri::command]
pub async fn casi_export(payload: Value) -> Result<Value, String> {
    let m: api::ExportModel = parse(payload)?;
    run(move |s| api::export_files(s, m)).await
}

#[tauri::command]
pub async fn casi_build_start(payload: Value) -> Result<Value, String> {
    let m: api::BuildStartModel = parse(payload)?;
    let state = app();
    tauri::async_runtime::spawn_blocking(move || {
        api::build_start(state, m).map_err(|e| e.detail)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn casi_build_status() -> Result<Value, String> {
    run(|s| api::build_status(s)).await
}

#[tauri::command]
pub async fn casi_build_cancel() -> Result<Value, String> {
    run(|s| api::build_cancel(s)).await
}

#[tauri::command]
pub async fn casi_indexes(include_stats: bool) -> Result<Value, String> {
    run(move |s| api::list_indexes(s, include_stats)).await
}

#[tauri::command]
pub async fn casi_index_import(payload: Value) -> Result<Value, String> {
    #[derive(serde::Deserialize)]
    struct M {
        name: String,
        path: String,
    }
    let m: M = parse(payload)?;
    run(move |s| api::import_index(s, &m.name, &m.path)).await
}

#[tauri::command]
pub async fn casi_index_delete(payload: Value) -> Result<Value, String> {
    #[derive(serde::Deserialize)]
    struct M {
        name: String,
        #[serde(default)]
        delete_files: bool,
    }
    let m: M = parse(payload)?;
    run(move |s| api::delete_index(s, &m.name, m.delete_files)).await
}

#[tauri::command]
pub async fn casi_settings_get() -> Result<Value, String> {
    run(|s| api::get_settings(s)).await
}

#[tauri::command]
pub async fn casi_settings_put(payload: Value) -> Result<Value, String> {
    run(move |s| api::put_settings(s, &payload)).await
}

#[tauri::command]
pub async fn casi_history_list() -> Result<Value, String> {
    run(|s| api::list_history(s)).await
}

#[tauri::command]
pub async fn casi_history_get(payload: Value) -> Result<Value, String> {
    #[derive(serde::Deserialize)]
    struct M {
        hid: String,
    }
    let m: M = parse(payload)?;
    run(move |s| api::get_history(s, &m.hid)).await
}

#[tauri::command]
pub async fn casi_history_delete(payload: Value) -> Result<Value, String> {
    #[derive(serde::Deserialize)]
    struct M {
        hid: String,
    }
    let m: M = parse(payload)?;
    run(move |s| api::delete_history(s, &m.hid)).await
}

#[tauri::command]
pub async fn casi_favorites_get() -> Result<Value, String> {
    run(|s| api::get_favorites(s)).await
}

#[tauri::command]
pub async fn casi_favorites_add(payload: Value) -> Result<Value, String> {
    let m: api::FavoriteModel = parse(payload)?;
    run(move |s| api::add_favorite(s, m)).await
}

#[tauri::command]
pub async fn casi_favorites_delete(payload: Value) -> Result<Value, String> {
    #[derive(serde::Deserialize)]
    struct M {
        fid: String,
    }
    let m: M = parse(payload)?;
    run(move |s| api::delete_favorite(s, &m.fid)).await
}

#[tauri::command]
pub async fn casi_error_log(payload: Value) -> Result<Value, String> {
    let m: api::ErrorLogModel = parse(payload)?;
    run(move |s| api::log_error(s, m)).await
}

/// 解析音频资源路径（前端经 convertFileSrc 引用本地文件）。
#[tauri::command]
pub fn casi_audio_path(path: String) -> String {
    path
}
