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
            // 尽早注入全局错误钩子（早于前端 bundle）：错误写入 localStorage + 上报后端，
            // 即使页面崩溃也能留痕，配合 DevTools(F12) 查看完整堆栈
            if let Some(win) = app.get_webview_window("main") {
                let script = r#"
(function () {
  function save(err) {
    try {
      var msg = (err && (err.message || err.stack || err)) || 'unknown';
      var key = 'cyrene-error-log';
      var prev = localStorage.getItem(key) || '';
      localStorage.setItem(key, (prev + '\n[' + new Date().toLocaleString() + '] ' + String(msg).slice(0, 2000)).slice(-8000));
      fetch('http://127.0.0.1:8765/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: String(msg).slice(0, 2000), location: location.hash, stack: (err && err.stack || '').slice(0, 3000) })
      }).catch(function () {});
    } catch (e) {}
  }
  window.addEventListener('error', function (e) { save(e.error || e.message); });
  window.addEventListener('unhandledrejection', function (e) { save(e.reason); });
  if (window.__TAURI_INTERNALS__) {
    try {
      window.__TAURI_INTERNALS__.invoke = (function (orig) {
        return function () {
          var args = Array.prototype.slice.call(arguments);
          return orig.apply(null, args).catch(function (e) { save(e); throw e; });
        };
      })(window.__TAURI_INTERNALS__.invoke);
    } catch (e) {}
  }
})();
"#;
                let _ = win.eval(script);
            }
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
