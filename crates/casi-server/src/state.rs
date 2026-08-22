//! 全局状态与 JSON 持久化。

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};

use casi_index::CasiFile;


use crate::build::BuildJob;
use crate::store;

/// 兼容旧版默认端口
pub const PORT: u16 = 8765;

pub const APP_VERSION: &str = "26.1.0";

/// LRU 缓存上限（段数，与旧版 INDEX_CACHE_MAX 一致）
pub const INDEX_CACHE_MAX: usize = 4;

pub struct AppState {
    pub data_dir: PathBuf,
    pub app_dir: PathBuf,
    pub settings: RwLock<serde_json::Value>,
    pub registry: RwLock<serde_json::Value>,
    pub favorites: RwLock<serde_json::Value>,
    pub history: RwLock<serde_json::Value>,
    /// seg_dir -> 打开的 .casi 文件集（LRU）
    pub index_cache: RwLock<LruCache>,
    pub build_job: std::sync::Mutex<Option<Arc<BuildJob>>>,
}

pub struct LruCache {
    map: HashMap<String, Arc<Vec<Arc<CasiFile>>>>,
    order: Vec<String>,
}

impl LruCache {
    pub fn new() -> Self {
        LruCache { map: HashMap::new(), order: Vec::new() }
    }
    pub fn get(&self, key: &str) -> Option<Arc<Vec<Arc<CasiFile>>>> {
        self.map.get(key).cloned()
    }
    pub fn insert(&mut self, key: String, value: Arc<Vec<Arc<CasiFile>>>) {
        if let Some(pos) = self.order.iter().position(|k| *k == key) {
            self.order.remove(pos);
        }
        self.map.insert(key.clone(), value);
        self.order.push(key);
        while self.order.len() > INDEX_CACHE_MAX {
            let old = self.order.remove(0);
            self.map.remove(&old);
        }
    }
    pub fn remove(&mut self, key: &str) {
        self.map.remove(key);
        self.order.retain(|k| k != key);
    }
    pub fn remove_prefix(&mut self, prefix: &std::path::Path) {
        let p = std::fs::canonicalize(prefix).unwrap_or(prefix.to_path_buf());
        let keys: Vec<String> = self.map.keys().cloned().collect();
        for k in keys {
            let kp = std::path::PathBuf::from(&k);
            let kp = std::fs::canonicalize(&kp).unwrap_or(kp);
            if kp.starts_with(&p) {
                self.remove(&k);
            }
        }
    }
}

impl AppState {
    pub fn new(data_dir: PathBuf, app_dir: PathBuf) -> Arc<Self> {
        std::fs::create_dir_all(&data_dir).ok();
        let state = Arc::new(AppState {
            data_dir: data_dir.clone(),
            app_dir,
            settings: RwLock::new(store::load_json(&data_dir.join("settings.json"), serde_json::json!({}))),
            registry: RwLock::new(store::load_json(&data_dir.join("indexes.json"), serde_json::json!({}))),
            favorites: RwLock::new(store::load_json(&data_dir.join("favorites.json"), serde_json::json!([]))),
            history: RwLock::new(store::load_json(&data_dir.join("history.json"), serde_json::json!([]))),
            index_cache: RwLock::new(LruCache::new()),
            build_job: std::sync::Mutex::new(None),
        });
        crate::store::ensure_settings(&state);
        state
    }

    pub fn save_settings(&self, s: &serde_json::Value) {
        store::save_json(&self.data_dir.join("settings.json"), s);
    }
    pub fn save_registry(&self, r: &serde_json::Value) {
        store::save_json(&self.data_dir.join("indexes.json"), r);
    }
    pub fn save_favorites(&self, f: &serde_json::Value) {
        store::save_json(&self.data_dir.join("favorites.json"), f);
    }
    pub fn save_history(&self, h: &serde_json::Value) {
        store::save_json(&self.data_dir.join("history.json"), h);
    }
    pub fn data_dir(&self) -> &PathBuf {
        &self.data_dir
    }
    pub fn settings_value(&self) -> serde_json::Value {
        self.settings.read().unwrap().clone()
    }
}


