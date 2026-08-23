//! `.casi` mmap 加载与查询（零解析）。
//!
//! 打开即校验 header 布局 → 后续所有访问直接指向 mmap 内存，无拷贝无解析。
//! 大索引（数十 GB）全部由 OS 页面缓存懒加载；冷加载 <5s 的目标由此达成。

use std::fs::File;
use std::ops::Range;
use std::path::Path;

use memmap2::Mmap;

use crate::format::{parse_header, Header, BUCKET_COUNT, FILE_RECORD_LEN, FormatError, POSTING_LEN};

#[derive(Debug)]
pub enum OpenError {
    Io(std::io::Error),
    Format(FormatError),
}

impl From<std::io::Error> for OpenError {
    fn from(e: std::io::Error) -> Self {
        OpenError::Io(e)
    }
}
impl From<FormatError> for OpenError {
    fn from(e: FormatError) -> Self {
        OpenError::Format(e)
    }
}

impl std::fmt::Display for OpenError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OpenError::Io(e) => write!(f, "io: {e}"),
            OpenError::Format(e) => write!(f, "format: {e}"),
        }
    }
}

impl std::error::Error for OpenError {}

pub struct CasiFile {
    map: Mmap,
    header: Header,
}

/// 行记录（posting）
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PostingRow {
    pub h: u32,
    pub fid: u32,
    pub t: u32,
}

/// 文件元数据
#[derive(Clone, Debug)]
pub struct FileRecord {
    pub fid: u32,
    pub name: String,
    pub path: String,
    pub duration: f64,
    pub status: u32,
}

impl CasiFile {
    /// 打开并 mmap。此调用本身不读入全部数据（page cache 懒加载）。
    pub fn open(path: &Path) -> Result<CasiFile, OpenError> {
        let file = File::open(path)?;
        let len = file.metadata()?.len();
        if len < crate::format::HEADER_LEN as u64 {
            return Err(FormatError::NotCasi.into());
        }
        let map = unsafe { Mmap::map(&file)? };
        let header = parse_header(&map)?;
        Ok(CasiFile { map, header })
    }

    #[inline]
    pub fn header(&self) -> &Header {
        &self.header
    }

    #[inline]
    pub fn hash_count(&self) -> u64 {
        self.header.hash_count
    }

    #[inline]
    pub fn file_count(&self) -> u64 {
        self.header.file_count
    }

    fn postings_off(&self) -> usize {
        self.header.postings_offset as usize
    }

    /// 桶 b 的行范围 [start, end)（posting 下标空间）。
    #[inline]
    fn bucket_bounds(&self, bucket: usize) -> Range<usize> {
        debug_assert!(bucket < BUCKET_COUNT as usize);
        let d = self.header.dir_offset as usize;
        let at = |i: usize| -> usize {
            let mut b = [0u8; 8];
            b.copy_from_slice(&self.map[d + i * 8..d + (i + 1) * 8]);
            u64::from_le_bytes(b) as usize
        };
        let start = at(bucket);
        let end = if bucket + 1 < BUCKET_COUNT as usize {
            at(bucket + 1)
        } else {
            self.header.hash_count as usize
        };
        start..end
    }

    /// 精确哈希 h → posting 行区间（区间为空/非法时返回 usize::MAX..usize::MAX）。
    pub fn lookup(&self, h: u32) -> Range<usize> {
        if h > crate::format::MAX_HASH {
            return usize::MAX..usize::MAX;
        }
        let bucket = (h >> 16) as usize;
        let bounds = self.bucket_bounds(bucket);
        if bounds.start >= bounds.end {
            return usize::MAX..usize::MAX;
        }
        let base = self.postings_off();
        let map_len = self.map.len();
        let row_abs = |i: usize| -> u32 {
            let o = base + i * POSTING_LEN;
            if o + 4 > map_len {
                panic!("casi: mmap 越界 (o={o}, map_len={map_len})");
            }
            u32::from_le_bytes(self.map[o..o + 4].try_into().unwrap())
        };
        // 桶内 h 升序 → 二分定位（绝对行下标）
        let lo = bounds.start + partition_lt(bounds.len(), |i| row_abs(bounds.start + i) < h);
        if lo == bounds.end {
            return usize::MAX..usize::MAX;
        }
        let hi = lo + partition_lt(bounds.end - lo, |i| row_abs(lo + i) <= h);
        if lo == hi {
            return usize::MAX..usize::MAX;
        }
        lo..hi
    }

    /// 帖子行（含 h）。
    #[inline]
    pub fn posting(&self, i: usize) -> PostingRow {
        let off = self.postings_off() + i * POSTING_LEN;
        if off + POSTING_LEN > self.map.len() {
            panic!("casi: posting OOB (i={i}, map_len={})", self.map.len());
        }
        let m = &self.map[off..off + POSTING_LEN];
        PostingRow {
            h: u32::from_le_bytes(m[0..4].try_into().unwrap()),
            fid: u32::from_le_bytes(m[4..8].try_into().unwrap()),
            t: u32::from_le_bytes(m[8..12].try_into().unwrap()),
        }
    }

    /// 文件记录迭代器。
    pub fn files(&self) -> FileIter<'_> {
        FileIter {
            map: &self.map,
            header: &self.header,
            idx: 0,
        }
    }

    /// 按 fid 查找文件记录（fid 升序记录 → 二分可加速；v1 线性即可，文件数有限）。
    pub fn file(&self, fid: u32) -> Option<FileRecord> {
        self.files().find(|f| f.fid == fid)
    }
}

#[inline]
fn partition_lt(len: usize, mut pred: impl FnMut(usize) -> bool) -> usize {
    // 等价的 lower_bound/upper_bound：返回第一个满足 !pred 的下标
    let mut lo = 0usize;
    let mut hi = len;
    while lo < hi {
        let mid = (lo + hi) / 2;
        if pred(mid) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

pub struct FileIter<'a> {
    map: &'a Mmap,
    header: &'a Header,
    idx: usize,
}

impl<'a> Iterator for FileIter<'a> {
    type Item = FileRecord;
    fn next(&mut self) -> Option<FileRecord> {
        if self.idx >= self.header.file_count as usize {
            return None;
        }
        let off = self.header.files_offset as usize + self.idx * FILE_RECORD_LEN;
        let rec = &self.map[off..off + FILE_RECORD_LEN];
        let fid = u32::from_le_bytes(rec[0..4].try_into().unwrap());
        let name_off = u32::from_le_bytes(rec[4..8].try_into().unwrap()) as usize;
        let name_len = u32::from_le_bytes(rec[8..12].try_into().unwrap()) as usize;
        let path_off = u32::from_le_bytes(rec[12..16].try_into().unwrap()) as usize;
        let path_len = u32::from_le_bytes(rec[16..20].try_into().unwrap()) as usize;
        let duration = f64::from_le_bytes(rec[20..28].try_into().unwrap());
        let status = u32::from_le_bytes(rec[28..32].try_into().unwrap());
        let sbase = self.header.strings_offset as usize;
        let name = String::from_utf8_lossy(&self.map[sbase + name_off..sbase + name_off + name_len])
            .into_owned();
        let path = String::from_utf8_lossy(&self.map[sbase + path_off..sbase + path_off + path_len])
            .into_owned();
        self.idx += 1;
        Some(FileRecord { fid, name, path, duration, status })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::builder::{Builder, FileMeta};

    fn build_small() -> tempfile::TempDir {
        let td = tempfile::tempdir().unwrap();
        let mut b = Builder::with_dir(td.path().to_path_buf(), 4096);
        // 人为行：bucket 0/1 各若干
        let buckets = [(1u32, 1u32), (0x0001_0000, 2u32), (0x0001_0001, 3u32), (0x0000_0005, 4u32)];
        for (h, fid) in buckets {
            b.push(crate::builder::Posting { h, fid, t: 100 });
        }
        b.add_file(FileMeta { fid: 1, name: "a.wav".into(), path: "C:/music/a.wav".into(), duration: 3.5, status: 1 });
        b.add_file(FileMeta { fid: 2, name: "b.wav".into(), path: "D:/lib/b.wav".into(), duration: 5.25, status: 1 });
        let out = td.path().join("test.casi");
        b.finish(&out).unwrap();
        td
    }

    #[test]
    fn roundtrip_and_lookup() {
        let td = build_small();
        let cf = CasiFile::open(&td.path().join("test.casi")).unwrap();
        assert_eq!(cf.hash_count(), 4);
        assert_eq!(cf.file_count(), 2);
        // 命中 bucket0 的 0x00000001
        let r = cf.lookup(0x0000_0001);
        assert!(r.start < r.end, "should hit");
        let row = cf.posting(r.start);
        assert_eq!((row.h, row.fid), (0x0000_0001, 1));
        // 未命中 → 空区间
        let miss = cf.lookup(0x0000_0011);
        assert!(miss.start >= miss.end || miss.start == usize::MAX);
        let files: Vec<_> = cf.files().collect();
        assert_eq!(files.len(), 2);
        assert_eq!(files[0].fid, 1);
        assert_eq!(files[0].name, "a.wav");
        assert_eq!(files[1].path, "D:/lib/b.wav");
        assert_eq!(files[0].duration, 3.5);
    }
}
