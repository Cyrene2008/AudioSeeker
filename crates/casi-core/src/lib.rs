//! casi-core - 音频指纹核心：DSP / 峰值提取 / 哈希生成。
//!
//! 参数与 Python 版 `backend/fp_core.py` 严格对齐：
//! - SR=11025, N_FFT=1024, HOP=256, F_BINS=511
//! - 周期 Hann 窗，center pad (constant)，幅度转 dB (ref=全局最大值)
//! - 5x5 2D 局部极大值 + 逐帧相对 12dB 窗口 + 每帧 top-3
//! - 峰值对哈希 (f1<<21 | f2<<12 | dt)，dt∈[2,4095]

pub mod decode;
pub mod dsp;
pub mod hasher;
pub mod peaks;

pub use decode::{load_audio, LoadError};
pub use hasher::extract_hashes;

/// 指纹采样率 (mono)
pub const SR: u32 = 11025;
/// FFT 长度
pub const N_FFT: usize = 1024;
/// 帧步进
pub const HOP: usize = 256;
/// 使用的频率 bin 数（0..510 -> 频点 1..511）
pub const F_BINS: usize = 511;
/// 绝对阈值下限（相对全局峰值，dB）
pub const PEAK_MIN_DB: f32 = -65.0;
/// 逐帧相对窗口（dB）
pub const PEAK_WINDOW_DB: f32 = 12.0;
/// 每帧最多保留峰数
pub const PEAK_PER_FRAME: usize = 3;
/// 每个锚点峰值向后配对数
pub const PAIR_WINDOW: usize = 25;
/// 最大时间差（帧）
pub const MAX_DT: u32 = 4095;
/// 频率差跨度（最多 511 个频点）
pub const F_SPAN_BITS: u32 = 9;
/// 每个频点位数
pub const DT_BITS: u32 = 12;
pub const F2_SHIFT: u32 = DT_BITS;
pub const F1_SHIFT: u32 = DT_BITS + F_SPAN_BITS;
/// 哈希总位数（30 位，u32 足够）
pub const HASH_BITS: u32 = F1_SHIFT + F_SPAN_BITS;
/// 每帧时长（秒）
pub const FRAME_SEC: f64 = HOP as f64 / SR as f64;

/// 经验平均哈希速率（哈希/秒音频），用于估计样本时长
pub const HASHES_PER_SEC: f64 = 900.0;
/// 单个命中簇最少对齐哈希数
pub const DEFAULT_MIN_ALIGNED: u32 = 8;

/// 频谱帧数：等价 librosa.stft(center=True) 的帧数
/// （每帧从 y[k*hop - pad] 起始，帧数 = 1 + floor(len/hop)，需 len>0 且 len/… 时至少 1 帧）
pub fn frame_count(samples: usize) -> usize {
    samples / HOP + 1
}
