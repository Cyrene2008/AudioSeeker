//! 峰值对哈希生成（Shazam 风格）。
//!
//! 每个锚点峰值与后方最多 PAIR_WINDOW 个峰值配对：
//!   hash = (f1 << F1_SHIFT) | (f2 << F2_SHIFT) | dt
//! 记录 (hash, 锚点帧号)。

use crate::{F1_SHIFT, F2_SHIFT, MAX_DT, PAIR_WINDOW};
use crate::peaks;

/// 提取指纹哈希，返回 (n, 2) 数组：每行 [hash, 锚点帧号]。
pub fn extract_hashes(m: &[f32], n_frames: usize) -> Vec<(u32, u32)> {
    let peaks = peaks::extract_peaks(m, n_frames);
    let mut out = Vec::with_capacity(peaks.len() * 8);
    let n = peaks.len();
    for i in 0..n {
        let pi = &peaks[i];
        let f1 = pi.bin as u32 + 1; // 频点 1..511
        let xi = pi.frame;
        let end = (i + PAIR_WINDOW + 1).min(n);
        for j in i + 1..end {
            let pj = &peaks[j];
            let dt = pj.frame - xi;
            if dt < 2 {
                continue;
            }
            if dt > MAX_DT {
                break; // frame 单调不减，后续只可能更大
            }
            let f2 = pj.bin as u32 + 1;
            let hash = (f1 << F1_SHIFT) | (f2 << F2_SHIFT) | dt;
            out.push((hash, xi));
        }
    }
    out
}

/// 便捷函数：直接由原始样本生成哈希（STFT → 峰值 → 配对）。
pub fn extract_hashes_from_samples(y: &[f32]) -> Vec<(u32, u32)> {
    let n_frames = crate::frame_count(y.len());
    let m = crate::dsp::stft_db(y);
    extract_hashes(&m, n_frames)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dsp;

    #[test]
    fn empty_audio_yields_no_hashes() {
        let y = vec![0f32; 0];
        assert!(extract_hashes_from_samples(&y).is_empty());
    }

    #[test]
    fn silence_yields_no_hashes() {
        let y = vec![0f32; 11025 * 2];
        assert!(extract_hashes_from_samples(&y).is_empty());
    }

    #[test]
    fn synthetic_chirp_yields_hashes() {
        // 2 秒线性扫频 100Hz→2000Hz @11025Hz
        let sr = 11025u32;
        let n = (sr * 2) as usize;
        let mut y = vec![0f32; n];
        for i in 0..n {
            let t = i as f32 / sr as f32;
            let freq = 100.0 + (2000.0 - 100.0) * t / 2.0;
            // 相位积分，避免频率跳变产生的谐波伪影
            let phase = 2.0 * std::f32::consts::PI * (100.0 * t + 950.0 * t * t / 2.0);
            y[i] = 0.9 * (phase).sin();
            let _ = freq;
        }
        let hs = extract_hashes_from_samples(&y);
        assert!(!hs.is_empty());
        for &(h, _) in &hs {
            assert!(h >> crate::HASH_BITS == 0, "hash 超出 30 位: {h:#x}");
        }
    }

    #[test]
    fn stft_dimensions() {
        let y = vec![0f32; 11025 * 3];
        let n = crate::frame_count(y.len());
        assert_eq!(n, 11025 * 3 / 256 + 1);
        let m = dsp::stft_db(&y);
        assert_eq!(m.len(), 511 * n);
    }
}
