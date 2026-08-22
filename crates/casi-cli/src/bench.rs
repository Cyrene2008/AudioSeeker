//! bench-fill 实现：合成哈希灌入大 .casi 索引 + 检索基准。
//!
//! 哈希分布模拟真实指纹（低频段 hash 常量 + 中高位伪随机），
//! 行数按 12 字节/行估算最终文件大小（12GB ≈ 10 亿行）。

use std::path::Path;
use std::time::Instant;

use casi_core::MAX_DT;
use casi_index::{CasiFile, FileMeta, Builder, Posting};

fn synthetic_hashes(n: usize, seed: u64) -> impl Iterator<Item = (u32, u32)> {
    let mut s = seed;
    let mut ctr = 0u32;
    std::iter::from_fn(move || {
        if ctr >= n as u32 {
            return None;
        }
        s = s.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        let x = (s >> 33) as u32;
        let dt = (x % MAX_DT) + 1;
        let f1 = ((x >> 8) % 511) + 1;
        let f2 = ((x >> 17) % 511) + 1;
        let h = (f1 << 21) | (f2 << 12) | dt;
        ctr += 1;
        Some((h, ctr.wrapping_mul(7) % 1_000_000))
    })
}

pub fn run(rows: &usize, out: &Path, queries: &usize) -> std::io::Result<()> {
    let t0 = Instant::now();
    let tmp = tempfile::Builder::new().prefix("bench_").tempdir()?;
    let mut builder = Builder::with_dir(tmp.path().to_path_buf(), 4_000_000);

    // 500 个虚拟文件表
    for f in 0..500u32 {
        builder.add_file(FileMeta {
            fid: f,
            name: format!("song_{f}.wav"),
            path: format!("D:/music/song_{f}.wav"),
            duration: 300.0,
            status: 1,
        });
    }
    let mut fid = 0u32;
    for (i, (h, t)) in synthetic_hashes(*rows, 42).enumerate() {
        if i % 4096 == 0 {
            fid = (fid + 1) % 500;
        }
        builder.push(Posting { h, fid, t });
    }
    let build_t = t0.elapsed();
    let t1 = Instant::now();
    let rows_written = builder.finish(out)?;
    let finish_t = t1.elapsed();
    println!(
        "build: {} 行, 写入耗时 {:.2}s, 文件大小 {:.1} MB ({:.1}s)", 
        rows_written,
        build_t.as_secs_f64(),
        std::fs::metadata(out)?.len() as f64 / 1_048_576.0,
        finish_t.as_secs_f64()
    );

    // 打开 + 检索
    let t2 = Instant::now();
    let idx = CasiFile::open(out).map_err(|e| std::io::Error::other(e.to_string()))?;
    let open_t = t2.elapsed();
    println!("mmap 打开+校验耗时: {:.4}s (行数 {:.2} 亿)", open_t.as_secs_f64(), rows_written as f64 / 1e8);

    let q: Vec<(u32, u32)> = synthetic_hashes(*queries, 7).collect();
    let t3 = Instant::now();
    let occs = casi_search::match_single(&idx, &q, None, None);
    let search_t = t3.elapsed();
    println!(
        "检索: {} 查询哈希 → {} 命中簇, 耗时 {:.4}s",
        q.len(),
        occs.len(),
        search_t.as_secs_f64()
    );
    // 触达页面的实际读取量
    let _ = idx.header().hash_count;
    Ok(())
}
