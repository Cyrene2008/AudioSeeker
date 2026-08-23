//! casi - Cyrene AudioSeeker 索引命令行工具。
//!
//! 子命令：
//!   build    扫描音频目录生成 .casi 索引
//!   match    样本音频 → 索引检索
//!   stats    索引统计
//!   hashfile 提取单文件指纹（调试/验证用）

use std::path::PathBuf;

use clap::{Parser, Subcommand};

mod bench;
mod builder_cli;
mod match_cli;
mod util;

#[derive(Parser)]
#[command(name = "casi", version, about = "Cyrene AudioSeeker index (rust)")]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// 构建 .casi 索引
    Build {
        /// 音频目录
        src_dir: PathBuf,
        /// 输出目录（含 index.casi）
        #[arg(long, default_value = "index-casi")]
        out: PathBuf,
        /// 并行工作线程数（0=auto）
        #[arg(long, default_value_t = 0)]
        workers: usize,
        /// 递归扫描子目录
        #[arg(long)]
        recursive: bool,
        /// 仅处理尚未入索引的文件（需已有 index.json 清单）
        #[arg(long)]
        incremental: bool,
        /// 每块行数（外排块大小，默认 1M）
        #[arg(long, default_value_t = 1_000_000)]
        chunk_rows: usize,
    },
    /// 样本音频 → 索引匹配
    Match {
        /// 样本文件（wav/mp3/flac/...）
        sample: PathBuf,
        /// 索引目录或单个 .casi 文件
        #[arg(long)]
        index: PathBuf,
        /// 样本起点（秒）
        #[arg(long, default_value_t = 0.0)]
        from: f64,
        /// 样本终点（秒）
        #[arg(long)]
        to: Option<f64>,
        /// 最少对齐哈希数（默认 8）
        #[arg(long)]
        min_aligned: Option<u32>,
        /// 对齐占比阈值（默认自适应）
        #[arg(long)]
        min_ratio: Option<f64>,
        /// 输出前 N 条
        #[arg(long, default_value_t = 0)]
        top: usize,
        /// JSON 输出到文件
        #[arg(long)]
        json: Option<PathBuf>,
    },
    /// 索引统计
    Stats {
        #[arg(long)]
        index: PathBuf,
    },
    /// 提取单文件指纹（调试/验证用）
    #[command(name = "hash-file", hide = true)]
    HashFile {
        sample: PathBuf,
    },
    /// 性能基准：合成哈希灌索引（隐藏）
    #[command(name = "bench-fill", hide = true)]
    BenchFill {
        /// 行数
        rows: usize,
        /// 输出 .casi 路径
        out: PathBuf,
        /// 查询哈希数（基准检索）
        #[arg(long, default_value_t = 10000)]
        queries: usize,
    },
}

fn main() {
    // Panic 日志（仅捕获 Rust panic，c0000409 fastfail 需 Windows 事件日志）
    std::panic::set_hook(Box::new(|info| {
        let thread = std::thread::current().name().unwrap_or("?").to_string();
        let loc = info.location().map(|l| format!("{}:{}:{}", l.file(), l.line(), l.column())).unwrap_or_default();
        let payload = info.payload();
        let msg = payload.downcast_ref::<String>().map(|s| s.as_str())
            .or_else(|| payload.downcast_ref::<&str>().copied())
            .unwrap_or("unknown");
        let full = format!("[{thread}] {loc}: {msg}\n");
        eprintln!("{full}");
        if let Ok(home) = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")) {
            let _ = std::fs::write(
                std::path::PathBuf::from(home).join(".casi-panic.log"),
                &full,
            );
        }
    }));
    let cli = Cli::parse();
    let code = match cli.cmd {
        Cmd::Build { src_dir, out, workers, recursive, incremental, chunk_rows } => {
            builder_cli::run_build(&src_dir, &out, workers, recursive, incremental, chunk_rows, &mut |msg| {
                println!("{msg}");
            })
        }
        Cmd::Match { sample, index, from, to, min_aligned, min_ratio, top, json } => {
            match match_cli::run_match(&sample, &index, from, to, min_aligned, min_ratio, top, json.as_deref()) {
                Ok(()) => 0,
                Err(e) => {
                    eprintln!("match 失败: {e}");
                    1
                }
            }
        }
        Cmd::Stats { index } => match match_cli::print_stats(&index) {
            Ok(()) => 0,
            Err(e) => {
                eprintln!("{e}");
                1
            }
        },
        Cmd::HashFile { sample } => match util::hashfile(&sample) {
            Ok(count) => {
                eprintln!("  hash 数: {count}");
                0
            }
            Err(e) => {
                eprintln!("{e}");
                1
            }
        },
        Cmd::BenchFill { rows, out, queries } => match bench_fill(&rows, &out, &queries) {
            Ok(()) => 0,
            Err(e) => {
                eprintln!("{e}");
                1
            }
        },
    };
    std::process::exit(code);
}

fn bench_fill(rows: &usize, out: &std::path::Path, queries: &usize) -> Result<(), String> {
    bench::run(rows, out, queries).map_err(|e| e.to_string())
}
