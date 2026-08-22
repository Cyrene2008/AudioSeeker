//! 峰值提取：2D 局部极大值 + 帧内相对 dB 窗口 + 每帧 top-N 秩选择。
//!
//! 逐帧秩选择保证切片与全文件的峰集合一致（对整体音量差异与切片时间原点
//! 均不敏感），静音帧被 PEAK_MIN_DB 排除。

use crate::{F_BINS, PEAK_MIN_DB, PEAK_PER_FRAME, PEAK_WINDOW_DB};

/// scipy.ndimage.maximum_filter(M, size=(5,5), mode='constant', cval=-200)
/// 等价实现：每个单元取 5x5 邻域最大值，越界视为 -200。
pub fn maximum_filter_5x5(m: &[f32], n_frames: usize, cval: f32) -> Vec<f32> {
    let rows = F_BINS;
    let cols = n_frames;
    let idx = |b: usize, f: usize| b * cols + f;
    let mut out = vec![cval; rows * cols];
    for b in 0..rows {
        let b_lo = b.saturating_sub(2);
        let b_hi = (b + 2).min(rows - 1);
        for f in 0..cols {
            let f_lo = f.saturating_sub(2);
            let f_hi = (f + 2).min(cols - 1);
            let mut best = cval;
            let mut r = b_lo;
            while r <= b_hi {
                let mut c = f_lo;
                while c <= f_hi {
                    let v = m[idx(r, c)];
                    if v > best {
                        best = v;
                    }
                    c += 1;
                }
                r += 1;
            }
            out[idx(b, f)] = best;
        }
    }
    out
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Peak {
    /// 频率 bin (0..509)
    pub bin: u16,
    /// 帧号
    pub frame: u32,
    /// 幅度 dB
    pub db: f32,
}

/// 提取峰值，返回按 (frame asc, db desc) 排序（同 Python np.lexsort((-vals, xs))）。
pub fn extract_peaks(m: &[f32], n_frames: usize) -> Vec<Peak> {
    let maxf = maximum_filter_5x5(m, n_frames, -200.0);

    // frame_max = M.max(axis=0)，window = max(frame_max - 12, -65)
    let mut frame_max = vec![f32::NEG_INFINITY; n_frames];
    for b in 0..F_BINS {
        for f in 0..n_frames {
            let v = m[b * n_frames + f];
            if v > frame_max[f] {
                frame_max[f] = v;
            }
        }
    }

    // mask = (M == maxf) & (M >= window) → row-major（bin asc, frame asc）
    let mut candidate = Vec::with_capacity(n_frames * 4);
    for b in 0..F_BINS {
        for f in 0..n_frames {
            let idx = b * n_frames + f;
            let v = m[idx];
            if v == maxf[idx] {
                let win = (frame_max[f] - PEAK_WINDOW_DB).max(PEAK_MIN_DB);
                if v >= win {
                    candidate.push(Peak { bin: b as u16, frame: f as u32, db: v });
                }
            }
        }
    }

    // lexsort((-vals, xs))：frame asc, db desc, 稳定（平局按行先序=bin asc）
    candidate.sort_by(|a, b| {
        a.frame.cmp(&b.frame).then(
            b.db.partial_cmp(&a.db).unwrap_or(std::cmp::Ordering::Equal).then(
                a.bin.cmp(&b.bin),
            ),
        )
    });

    // 每帧保留 top-PEAK_PER_FRAME（连续段截断，等价 Python 的循环）
    let mut out = Vec::with_capacity(candidate.len());
    let mut i = 0;
    while i < candidate.len() {
        let f = candidate[i].frame;
        let mut j = i;
        while j < candidate.len() && candidate[j].frame == f {
            j += 1;
        }
        let end = (i + PEAK_PER_FRAME).min(j);
        out.extend_from_slice(&candidate[i..end]);
        i = j;
    }
    out
}
