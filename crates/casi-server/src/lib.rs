//! casi-server - Cyrene AudioSeeker 内嵌 HTTP 服务。
//!
//! 设计目标：单进程（Tauri 内嵌 or 独立运行），零运行时依赖。
//! - 索引：.casi mmap 直接映射，缓存 LRU-4（与旧 Python 版一致）
//! - 构建：后台 rayon 流水线，进度内存共享（无子进程、无 JSONL）
//! - 导出：按索引将源文件直接复制到目标目录（全文件，非片段拼接）
//! - 设置/注册表/收藏/历史：JSON 持久化（与旧版文件/字段兼容）

pub mod api;
pub mod build;
pub mod routes;
pub mod segments;
pub mod state;
pub mod store;

pub use state::{AppState, APP_VERSION};

/// 启动服务（阻塞直到关闭）。tauri 集成侧在单独线程调用。
pub fn serve_block(data_dir: std::path::PathBuf, app_dir: std::path::PathBuf, port: u16) -> std::io::Result<()> {
    let rt = tokio::runtime::Runtime::new()?;
    rt.block_on(serve_async(data_dir, app_dir, port))
}

/// 异步启动，直到监听失败或进程退出。
pub async fn serve_async(
    data_dir: std::path::PathBuf,
    app_dir: std::path::PathBuf,
    port: u16,
) -> std::io::Result<()> {
    let app = build_app(data_dir, app_dir);
    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], port));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await
}

/// 构建路由（独立于端口，便于测试）。
pub fn build_app(data_dir: std::path::PathBuf, app_dir: std::path::PathBuf) -> axum::Router {
    let state = AppState::new(data_dir, app_dir);
    routes::router(state)
}
