//! Cyreneの音频检索器 - Tauri 入口。

mod backend;
mod commands;

use tauri_plugin_global_shortcut::GlobalShortcutExt;

use tauri::Manager;

#[tauri::command]
fn reveal_in_explorer(path: String) {
    let _ = std::process::Command::new("explorer")
        .arg("/select,")
        .arg(&path)
        .spawn();
}

#[tauri::command]
fn open_path(path: String) {
    let _ = std::process::Command::new("explorer")
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
        .plugin(tauri_plugin_global_shortcut::Builder::new().with_handler(|app, shortcut, _event| {
            // F12 打开开发者工具（诊断用）
            if shortcut.matches(tauri_plugin_global_shortcut::Modifiers::empty(),
                                tauri_plugin_global_shortcut::Code::F12) {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.open_devtools();
                }
            }
        }).build())
        .setup(|app| {
            let handle = app.handle().clone();
            backend::setup(&handle);
            let _ = app.global_shortcut().register("F12");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            backend::backend_status,
            backend::app_version,
            backend_port,
            reveal_in_explorer,
            open_path,
            commands::casi_match,
            commands::casi_export,
            commands::casi_build_start,
            commands::casi_build_status,
            commands::casi_build_cancel,
            commands::casi_indexes,
            commands::casi_index_import,
            commands::casi_index_delete,
            commands::casi_settings_get,
            commands::casi_settings_put,
            commands::casi_history_list,
            commands::casi_history_get,
            commands::casi_history_delete,
            commands::casi_favorites_get,
            commands::casi_favorites_add,
            commands::casi_favorites_delete,
            commands::casi_error_log,
            commands::casi_audio_path,
        ])
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                backend::backend_kill();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
