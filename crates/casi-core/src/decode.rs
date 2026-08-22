//! 音频解码。
//!
//! 设计（对齐 Python 版语义，目标"安装即用、无系统依赖"）：
//! - .wav 直接经 hound 读取（与 Python soundfile 对齐）
//! - 其余格式经 ffmpeg 子进程解码（生产版 ffmpeg 作为安装内 sidecar 随包分发，
//!   见 .plan/TODO.md Phase 2；Python 版 _ffmpeg_load 用同样参数）
//!
//! 目标输出：单声道 SR=11025 f32 向量。解码链与 Python 语义一致：
//! librosa.load(sr=SR, mono=True) vs ffmpeg -ac 1 -ar 11025。

use std::io::BufReader;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use crate::SR;

fn ext(path: &Path) -> String {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_ascii_lowercase())
        .unwrap_or_default()
}

#[derive(Debug)]
pub enum LoadError {
    Empty,
    Io(String),
    Ffmpeg(String),
    Unsupported(String),
}

impl std::fmt::Display for LoadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LoadError::Empty => write!(f, "empty audio"),
            LoadError::Io(e) => write!(f, "io error: {e}"),
            LoadError::Ffmpeg(e) => write!(f, "ffmpeg decode failed: {e}"),
            LoadError::Unsupported(e) => write!(f, "unsupported: {e}"),
        }
    }
}

impl std::error::Error for LoadError {}

/// 加载音频为单声道 11025Hz f32。
pub fn load_audio(path: &Path) -> Result<Vec<f32>, LoadError> {
    let y = match ext(path).as_str() {
        "wav" => read_wav(path)?,
        _ => ffmpeg_load(path)?,
    };
    if y.is_empty() {
        return Err(LoadError::Empty);
    }
    Ok(y)
}

/// WAV：hound 直接读取 float（按 i16 归一化），必要时重采样到 SR。
/// 与 Python soundfile 读取语义一致。
fn read_wav(path: &Path) -> Result<Vec<f32>, LoadError> {
    let file = std::fs::File::open(path).map_err(|e| LoadError::Io(e.to_string()))?;
    let mut reader =
        hound::WavReader::new(BufReader::new(file)).map_err(|e| LoadError::Io(format!("{e}")))?;
    let spec = reader.spec();
    let channels = spec.channels as usize;
    let rate = spec.sample_rate;
    let samples: Vec<i16> = reader
        .samples::<i16>()
        .collect::<Result<_, _>>()
        .map_err(|e| LoadError::Io(format!("{e}")))?;
    let mono: Vec<f32> = if channels == 1 {
        samples.into_iter().map(|s| s as f32 / 32768.0).collect()
    } else {
        samples
            .chunks_exact(channels)
            .map(|c| c.iter().map(|&s| s as f32 / 32768.0).sum::<f32>() / channels as f32)
            .collect()
    };
    Ok(if rate == SR {
        mono
    } else {
        resample(&mono, rate, SR)
    })
}

/// 线性插值重采样（soxr_hq 的数值上界可用，WAV@SR 通常跳过本步）。
pub fn resample(input: &[f32], from_rate: u32, to_rate: u32) -> Vec<f32> {
    if from_rate == to_rate || input.is_empty() {
        return input.to_vec();
    }
    let ratio = to_rate as f64 / from_rate as f64;
    let out_len = (input.len() as f64 * ratio).round() as usize;
    let mut out = Vec::with_capacity(out_len + 1);
    for i in 0..out_len {
        let pos = i as f64 / ratio;
        let idx = pos.floor() as usize;
        let frac = (pos - idx as f64) as f32;
        let a = input.get(idx).copied().unwrap_or(0.0);
        let b = input.get(idx + 1).copied().unwrap_or(0.0);
        out.push(a + (b - a) * frac);
    }
    out
}

/// 定位 ffmpeg：exe 旁 sidecar 优先（ffmpeg/bin/ffmpeg[.exe]），回退系统 PATH。
pub fn locate_ffmpeg() -> PathBuf {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            for cand in ["ffmpeg.exe", "ffmpeg"] {
                let p = dir.join("ffmpeg").join("bin").join(cand);
                if p.is_file() {
                    return p;
                }
            }
        }
    }
    PathBuf::from("ffmpeg")
}

/// ffmpeg 解码为 WAV(峰值率 11025) 再由 hound 读取。
fn ffmpeg_load(path: &Path) -> Result<Vec<f32>, LoadError> {
    let tmp = tempfile::Builder::new()
        .prefix("casi_decode_")
        .suffix(".wav")
        .tempfile()
        .map_err(|e| LoadError::Io(e.to_string()))?;
    let tmp_path = tmp.path().to_path_buf();
    let output = Command::new(locate_ffmpeg())
        .args(["-hide_banner", "-loglevel", "error", "-y", "-i"])
        .arg(path)
        .arg("-ac")
        .arg("1")
        .arg("-ar")
        .arg(SR.to_string())
        .arg(tmp_path.as_os_str())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| LoadError::Ffmpeg(format!("cannot spawn ffmpeg: {e}")))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let tail: String =
            stderr.chars().rev().take(200).collect::<Vec<_>>().into_iter().rev().collect();
        return Err(LoadError::Ffmpeg(tail));
    }
    read_wav(&tmp_path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resample_length() {
        let input = vec![0.5f32; 44100 * 2];
        let out = resample(&input, 44100, 11025);
        assert_eq!(out.len(), 11025 * 2);
        assert!(out.iter().all(|&v| (v - 0.5).abs() < 1e-4));
    }
}
