//! casi-server 独立运行入口（调试/服务化用）。
//!
//! 环境变量：
//!   CYRENE_APP_DIR  app 目录（默认当前目录）
//!   CYRENE_DATA_DIR 数据目录（默认 %TEMP%/cyrene-audio-seeker）
//!   CYRENE_PORT     端口（默认 8765）

fn main() {
    let app_dir = std::env::var("CYRENE_APP_DIR")
        .map(std::path::PathBuf::from)
        .unwrap_or(std::env::current_dir().unwrap());
    let data_dir = std::env::var("CYRENE_DATA_DIR")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|_| {
            std::path::PathBuf::from(std::env::temp_dir()).join("cyrene-audio-seeker")
        });
    let port: u16 = std::env::var("CYRENE_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(casi_server::state::PORT);
    eprintln!("casi-server {} listening 127.0.0.1:{}", casi_server::APP_VERSION, port);
    if let Err(e) = casi_server::serve_block(data_dir, app_dir, port) {
        eprintln!("server 启动失败: {e}");
        std::process::exit(1);
    }
}
