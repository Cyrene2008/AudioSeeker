//! 频谱图（STFT + dB），参数与 librosa.stft / amplitude_to_db 对齐。

use crate::{N_FFT, HOP, F_BINS, frame_count};
use rustfft::{num_complex::Complex32, FftPlanner};

/// 周期 Hann 窗（librosa.stft 默认 fftbins 行为，实测 = periodic）
pub fn hann_periodic(n: usize) -> Vec<f32> {
    (0..n)
        .map(|i| 0.5 - 0.5 * ((2.0 * std::f64::consts::PI * i as f64) / n as f64).cos())
        .map(|v| v as f32)
        .collect()
}

/// 计算频谱图 dB，行优先布局 (F_BINS x n_frames)。
/// M[bin * n_frames + frame]
///
/// 等价：
///  S = np.abs(librosa.stft(y, n_fft=1024, hop_length=256))
///  M = librosa.amplitude_to_db(S, ref=np.max)
///  M = M[:511, :]
///
/// - 周期 Hann 窗（不可与对称窗混用，否则峰值会漂移）
/// - center padding 两侧各 N_FFT/2 个零样本（pad_mode='constant'）
///
/// 说明：amplitude_to_db(ref=np.max) 按全局最大值归一，任何全局常数
///（例如 FFT 库的尺度约定）都会抵消，因此无需额外归一化因子。
/// rustfft 前向变换与 numpy 同为"无归一化"约定。
pub fn stft_db(y: &[f32]) -> Vec<f32> {
    let n_frames = frame_count(y.len());
    let mut planner = FftPlanner::new();
    let plan = planner.plan_fft_forward(N_FFT);
    let window = hann_periodic(N_FFT);

    let mut out = vec![0f32; F_BINS * n_frames];
    let mut scratch = Vec::<Complex32>::with_capacity(N_FFT);
    let mut wbuf = vec![0f32; N_FFT];

    // frame 覆盖 y_padded[start : start+n_fft]，y_padded = [pad个零, y, pad个零]
    // y_index_in_window = start + j - pad，j 为窗字段下标
    let pad = N_FFT / 2;
    let mut global_max_mag: f32 = 0.0;
    for fx in 0..n_frames {
        let start = fx * HOP;
        wbuf.fill(0.0);
        // 信号在窗内的拷贝偏移：j0 = max(pad - start, 0)；y 的起始下标 lo = max(start - pad, 0)
        let coff = pad.saturating_sub(start);
        let lo = start.saturating_sub(pad);
        let avail = y.len().saturating_sub(lo).min(N_FFT - coff);
        if avail > 0 {
            wbuf[coff..coff + avail].copy_from_slice(&y[lo..lo + avail]);
        }
        for i in 0..N_FFT {
            wbuf[i] *= window[i];
        }
        scratch.clear();
        scratch.extend(wbuf.iter().map(|&s| Complex32::new(s, 0.0)));
        plan.process(&mut scratch);
        for b in 0..F_BINS {
            let mag = scratch[b].norm();
            let db = if mag <= 1e-5f32 { -100.0 } else { 20.0f32 * mag.log10() };
            out[b * n_frames + fx] = db;
            if mag > global_max_mag {
                global_max_mag = mag;
            }
        }
    }

    // amplitude_to_db(S, ref=np.max)：M = db - 20*log10(max_mag)
    let ref_db = if global_max_mag <= 1e-5f32 {
        0.0
    } else {
        20.0f32 * global_max_mag.log10()
    };
    if ref_db != 0.0 {
        for v in &mut out {
            *v -= ref_db;
        }
    }
    out
}
