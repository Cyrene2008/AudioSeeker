//! casi-index - `.casi` 二进制索引格式（Cyrene AudioSeeker Index）。
//!
//! 目标：mmap 零解析加载（12GB < 5s）+ 桶目录二进制哈希表检索。

pub mod builder;
pub mod format;
pub mod mmap;

pub use builder::{BuildData, Builder, FileMeta, Posting};
pub use format::{Header, BUCKET_COUNT, FormatError};
pub use mmap::{CasiFile, FileRecord, OpenError, PostingRow};
