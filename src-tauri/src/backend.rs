//! backend.rs - 纯 Rust 单进程后端入口（AppState 初始化 + 状态查询）。
//!
//! 发行版不走 HTTP：前端通过 Tauri command 直通 casi-server 逻辑层
//! （见 commands.rs）。casi-server 的 axum 形态仅用于服务化部署/调试。

use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};

use serde::Serialize;
use tauri::Manager;

const DEFAULT_PORT: u16 = 8765;

#[derive(Clone, Serialize, Default, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Phase {
    #[default]
    Starting,
    Ready,
}

#[derive(Clone, Serialize, Default)]
pub struct BootState {
    pub phase: Phase,
    pub detail: String,
    pub progress: f32,
    pub port: u16,
    pub ready: bool,
    pub error: String,
}

static STATE: OnceLock<Mutex<BootState>> = OnceLock::new();

pub fn state() -> &'static Mutex<BootState> {
    STATE.get_or_init(|| {
        Mutex::new(BootState {
            phase: Phase::Ready,
            detail: "就绪".into(),
            progress: 1.0,
            port: DEFAULT_PORT,
            ready: true,
            error: String::new(),
        })
    })
}

// ---------- 路径 ----------

fn app_dirs(app: &tauri::AppHandle) -> PathBuf {
    app.path().app_config_dir().unwrap_or_else(|_| {
        std::env::current_exe().unwrap_or_default().parent().unwrap_or(Path::new(".")).to_path_buf()
    })
}

/// 旧标识符 cn.cyrene2008.audioseeker 的用户数据目录一次性迁移到新标识符目录。
fn migrate_legacy_app_dir(app_dir: &Path) {
    if app_dir.exists() {
        return;
    }
    let Ok(base) = std::env::var("APPDATA") else { return };
    let legacy = Path::new(&base).join("cn.cyrene2008.audioseeker");
    if legacy.is_dir() {
        let _ = std::fs::rename(&legacy, app_dir);
    }
}

/// setup 时调用：初始化 AppState（无下载、无端口监听、亚毫秒级完成）。
pub fn setup(app: &tauri::AppHandle) {
    let app_dir = app_dirs(app);
    migrate_legacy_app_dir(&app_dir);
    let data_dir = app_dir.join("data");
    let _ = std::fs::create_dir_all(&data_dir);
    crate::commands::init_app(data_dir, app_dir);
}

/// 退出清理：无子进程/无监听端口，仅占位保持接口兼容。
pub fn backend_kill() {
    // 内嵌模型：无子进程需要清理。
}

// ---------- Tauri 命令 ----------

#[tauri::command]
pub fn backend_status() -> BootState {
    state().lock().map(|g| g.clone()).unwrap_or_else(|e| e.into_inner().clone())
}

#[tauri::command]
pub fn app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
