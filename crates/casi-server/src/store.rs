//! JSON 持久化（与旧 Python 版 settings/indexes/favorites/history 兼容）。

use std::path::Path;

use serde_json::{json, Value};

pub fn load_json(path: &Path, default: Value) -> Value {
    std::fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or(default)
}

pub fn save_json(path: &Path, value: &Value) {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).ok();
    }
    if let Ok(s) = serde_json::to_string_pretty(value) {
        let _ = std::fs::write(path, format!("{s}\n"));
    }
}

/// v26 起默认浅色：清掉旧版残留的 dark/theme 设置，补齐默认值。
pub fn ensure_settings(state: &crate::AppState) {
    let default_index_dir = state.app_dir.join("index");
    let mut s = state.settings_value();
    if s.get("schema").and_then(|v| v.as_i64()).unwrap_or(1) < 2 {
        if let Some(o) = s.as_object_mut() {
            o.remove("dark");
            o.remove("theme");
        }
        s["schema"] = json!(2);
        state.save_settings(&s);
    }
    create_defaults(state, &mut s, &default_index_dir);
}

fn create_defaults(state: &crate::AppState, s: &mut Value, default_index_dir: &Path) {
    if let Some(o) = s.as_object_mut() {
        if !o.contains_key("default_index_dir") {
            o.insert("default_index_dir".into(), json!(default_index_dir.to_string_lossy()));
        }
        for (k, v) in [
            ("lang", json!("zh")),
            ("dark", json!(false)),
            ("theme", json!("peach")),
            ("unload_index_after_search", json!(false)),
        ] {
            if !o.contains_key(k) {
                o.insert(k.into(), v);
            }
        }
    }
    state.save_settings(s);
}
