//! `.casi` 二进制索引格式 v1（Cyrene AudioSeeker Index）。
//!
//! 设计目标：
//! - mmap 直接映射，零解析、零构建，加载即用（12GB 索引 < 5s）
//! - 检索走 2^16 桶目录（hash 高 16 位）→ 对应 posting 区间二分，O(log per-bucket)
//! - 所有数值小端，无指针，跨平台可移植（Win/macOS/Linux/Android/iOS）
//!
//! ## 文件布局
//! ```text
//! ┌──────────────────────────────────────────────┐
//! │ Header (128 B, 固定)                         │
//! ├──────────────────────────────────────────────┤
//! │ Bucket Directory (bucket_count * 8 B)        │
//! │   dir[b] = postings 中桶 b 的行起始下标       │
//! │   （行序连续；桶末 = dir[b+1]，最后桶末 = hash_count）│
//! ├──────────────────────────────────────────────┤
//! │ Postings (hash_count * 12 B)                 │
//! │   行: h u32 | fid u32 | t u32，按 h 升序      │
//! ├──────────────────────────────────────────────┤
//! │ Files (file_count * 32 B)                    │
//! │   行: fid u32 | name_off u32 | name_len u32  │
//! │       | path_off u32 | path_len u32 | dur f64│
//! ├──────────────────────────────────────────────┤
//! │ String Arena (UTF-8 连续区)                  │
//! └──────────────────────────────────────────────┘
//! ```
//!
//! Header 字段偏移（小端）:
//! ```text
//! 0  magic     "CASI" (4B)
//! 4  version   u32 = 1
//! 8  file_count  u64
//! 16 hash_count  u64
//! 24 bucket_count u32
//! 28 _pad u32
//! 32 dir_offset    u64 (绝对偏移)
//! 40 postings_offset u64
//! 48 files_offset u64
//! 56 strings_offset u64
//! 64 strings_len u64
//! 72 total_len u64
//! 80 reserved [u8;48]
//! ```

use std::fmt;

pub const MAGIC: [u8; 4] = *b"CASI";
pub const VERSION: u32 = 1;
pub const HEADER_LEN: usize = 128;
pub const BUCKET_BITS: u32 = 16;
pub const BUCKET_COUNT: u32 = 1 << BUCKET_BITS;
pub const POSTING_LEN: usize = 12;
pub const FILE_RECORD_LEN: usize = 32;
pub const MAX_HASH: u32 = (1 << (casi_core::HASH_BITS)) - 1;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Header {
    pub file_count: u64,
    pub hash_count: u64,
    pub bucket_count: u32,
    pub dir_offset: u64,
    pub postings_offset: u64,
    pub files_offset: u64,
    pub strings_offset: u64,
    pub strings_len: u64,
    pub total_len: u64,
}

impl Header {
    pub fn write_to(&self, out: &mut Vec<u8>) {
        out.extend_from_slice(&MAGIC);
        out.extend_from_slice(&VERSION.to_le_bytes());
        out.extend_from_slice(&self.file_count.to_le_bytes());
        out.extend_from_slice(&self.hash_count.to_le_bytes());
        out.extend_from_slice(&self.bucket_count.to_le_bytes());
        out.extend_from_slice(&0u32.to_le_bytes());
        out.extend_from_slice(&self.dir_offset.to_le_bytes());
        out.extend_from_slice(&self.postings_offset.to_le_bytes());
        out.extend_from_slice(&self.files_offset.to_le_bytes());
        out.extend_from_slice(&self.strings_offset.to_le_bytes());
        out.extend_from_slice(&self.strings_len.to_le_bytes());
        out.extend_from_slice(&self.total_len.to_le_bytes());
        out.extend_from_slice(&[0u8; 48]);
        debug_assert_eq!(out.len(), HEADER_LEN);
    }
}

#[derive(Debug)]
pub enum FormatError {
    NotCasi,
    UnsupportedVersion(u32),
    Truncated(&'static str),
    BadLayout(&'static str),
    InvalidUtf8,
}

impl fmt::Display for FormatError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            FormatError::NotCasi => write!(f, "not a .casi file (bad magic)"),
            FormatError::UnsupportedVersion(v) => write!(f, "unsupported .casi version: {v}"),
            FormatError::Truncated(what) => write!(f, "truncated .casi: {what}"),
            FormatError::BadLayout(what) => write!(f, "bad .casi layout: {what}"),
            FormatError::InvalidUtf8 => write!(f, "invalid utf-8 in string arena"),
        }
    }
}

impl std::error::Error for FormatError {}

/// 从 mmap buffer 解析并校验 header。
pub fn parse_header(buf: &[u8]) -> Result<Header, FormatError> {
    if buf.len() < HEADER_LEN || &buf[0..4] != &MAGIC {
        return Err(FormatError::NotCasi);
    }
    let rd = |off: usize| -> u64 {
        buf[off..off + 8].try_into().map(u64::from_le_bytes).unwrap()
    };
    let version = u32::from_le_bytes(buf[4..8].try_into().unwrap());
    if version != VERSION {
        return Err(FormatError::UnsupportedVersion(version));
    }
    let h = Header {
        file_count: rd(8),
        hash_count: rd(16),
        bucket_count: u32::from_le_bytes(buf[24..28].try_into().unwrap()),
        dir_offset: rd(32),
        postings_offset: rd(40),
        files_offset: rd(48),
        strings_offset: rd(56),
        strings_len: rd(64),
        total_len: rd(72),
    };
    if h.bucket_count != BUCKET_COUNT {
        return Err(FormatError::BadLayout("bucket_count != 65536"));
    }
    validate_layout(&h, buf.len() as u64)?;
    Ok(h)
}

/// 校验布局边界（防越界）。
pub fn validate_layout(h: &Header, file_len: u64) -> Result<(), FormatError> {
    if h.hash_count as usize > 100_000_000_000 {
        return Err(FormatError::BadLayout("hash_count absurd"));
    }
    if h.file_count as usize > 100_000_000 {
        return Err(FormatError::BadLayout("file_count absurd"));
    }
    let postings_end = h
        .postings_offset
        .checked_add(h.hash_count.checked_mul(POSTING_LEN as u64).unwrap())
        .ok_or(FormatError::BadLayout("postings overflow"))?;
    let files_end = h
        .files_offset
        .checked_add(h.file_count.checked_mul(FILE_RECORD_LEN as u64).unwrap())
        .ok_or(FormatError::BadLayout("files overflow"))?;
    let strings_end = h.strings_offset.checked_add(h.strings_len).ok_or(FormatError::BadLayout("strings overflow"))?;
    let dir_end = h
        .dir_offset
        .checked_add(BUCKET_COUNT as u64 * 8)
        .ok_or(FormatError::BadLayout("dir overflow"))?;
    if file_len < h.total_len
        || file_len < strings_end
        || file_len < files_end
        || file_len < postings_end
        || file_len < dir_end
    {
        return Err(FormatError::BadLayout("offsets exceed file length"));
    }
    if !(h.dir_offset >= HEADER_LEN as u64
        && h.postings_offset >= dir_end
        && h.files_offset >= postings_end
        && h.strings_offset >= files_end)
    {
        return Err(FormatError::BadLayout("sections out of order"));
    }
    Ok(())
}
