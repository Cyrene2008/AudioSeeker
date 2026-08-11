//! Cyreneの音频检索器 - Tauri 入口。

mod backend;

use tauri::Manager;

#[tauri::command]
fn reveal_in_explorer(path: String) {
    let _ = std::process::Command::new("explorer")
        .arg("/select,")
        .arg(&path)
        .spawn();
}

#[tauri::command]
fn backend_port() -> u16 {
    backend::state()
        .lock()
        .map(|s| s.port)
        .unwrap_or(8765)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // 二次启动：聚焦已有主窗口
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            backend::setup(&handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            backend::backend_status,
            backend::app_version,
            backend_port,
            reveal_in_explorer,
        ])
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                backend::backend_kill();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
