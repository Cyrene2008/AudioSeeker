//! 公共工具：指纹提取、文件扫描。

use std::path::Path;

use casi_core::{dsp, extract_hashes, load_audio, SR, frame_count};

pub fn extract_hashes_from_samples(y: &[f32]) -> Vec<(u32, u32)> {
    let n = frame_count(y.len());
    let m = dsp::stft_db(y);
    extract_hashes(&m, n)
}

/// 加载样本 + 时间裁剪（与 Python load_audio + from/to 语义一致）。
pub fn load_and_trim(
    sample: &Path,
    from_s: f64,
    to_s: Option<f64>,
) -> Result<Vec<f32>, String> {
    let y = load_audio(sample).map_err(|e| e.to_string())?;
    let y = match to_s {
        Some(t) => {
            let a = (from_s * SR as f64) as usize;
            let b = (t * SR as f64) as usize;
            y.get(a.min(y.len())..b.min(y.len())).unwrap_or(&[]).to_vec()
        }
        None => {
            let a = (from_s * SR as f64) as usize;
            y.get(a.min(y.len())..).unwrap_or(&[]).to_vec()
        }
    };
    if y.is_empty() {
        return Err("样本切片为空".into());
    }
    Ok(y)
}

pub fn scan_audio_files(dir: &Path, recursive: bool) -> Result<Vec<std::path::PathBuf>, String> {
    let mut out = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(d) = stack.pop() {
        let rd = std::fs::read_dir(&d).map_err(|e| format!("读取目录失败 {}: {e}", d.display()))?;
        let mut entries: Vec<_> = rd.filter_map(|e| e.ok()).map(|e| e.path()).collect();
        entries.sort();
        for p in entries {
            if p.is_dir() {
                if recursive {
                    stack.push(p);
                }
                continue;
            }
            if let Some(ext) = p.extension().and_then(|e| e.to_str()) {
                let e = ext.to_ascii_lowercase();
                if matches!(e.as_str(), "wav" | "flac" | "mp3" | "ogg" | "oga" | "opus" | "aac" | "m4a" | "mp4" | "wma" | "aiff" | "aif") {
                    out.push(p);
                }
            }
        }
    }
    out.sort();
    Ok(out)
}

pub fn fmt_sec(s: f64) -> String {
    let total = s.max(0.0).round() as u64;
    format!("{}:{:02}", total / 60, total % 60)
}

/// 提取单文件指纹并打印（调试/验证用）：每行 "hash 帧"。
pub fn hashfile(sample: &Path) -> Result<usize, String> {
    let y = load_audio(sample).map_err(|e| e.to_string())?;
    let hs = extract_hashes_from_samples(&y);
    let mut sorted = hs.clone();
    sorted.sort_unstable_by_key(|&(h, _)| h);
    for &(h, t) in &sorted {
        println!("{h:08x} {t}");
    }
    Ok(hs.len())
}
