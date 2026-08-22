//! `.casi` 构建器。
//!
//! 设计：分块外排（chunked external sort）。posting 流经内存缓冲，超过块大小
//! 即排序落盘；finish() 时 k 路归并写出升序 postings 并流式计算桶目录。
//! 100M 级行数内存占用受控（块数 × 块大小）。

use std::collections::BinaryHeap;
use std::fs::File;
use std::io::{BufReader, BufWriter, Read, Write};
use std::path::{Path, PathBuf};

use crate::format::{BUCKET_COUNT, FILE_RECORD_LEN, HEADER_LEN, Header, POSTING_LEN, MAX_HASH};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Posting {
    pub h: u32,
    pub fid: u32,
    pub t: u32,
}

impl Posting {
    fn to_bytes(self) -> [u8; POSTING_LEN] {
        let mut b = [0u8; POSTING_LEN];
        b[0..4].copy_from_slice(&self.h.to_le_bytes());
        b[4..8].copy_from_slice(&self.fid.to_le_bytes());
        b[8..12].copy_from_slice(&self.t.to_le_bytes());
        b
    }

    fn from_bytes(b: &[u8]) -> Self {
        Posting {
            h: u32::from_le_bytes(b[0..4].try_into().unwrap()),
            fid: u32::from_le_bytes(b[4..8].try_into().unwrap()),
            t: u32::from_le_bytes(b[8..12].try_into().unwrap()),
        }
    }
}

#[derive(Clone, Debug)]
pub struct FileMeta {
    pub fid: u32,
    pub name: String,
    pub path: String,
    pub duration: f64,
    pub status: u32,
}

/// 内存中一次构建的输入。
pub struct BuildData {
    rows: Vec<Posting>,
    files: Vec<FileMeta>,
}

pub struct Builder {
    chunk_rows: Vec<Posting>,
    chunk_cap: usize,
    chunks: Vec<PathBuf>,
    tmp_dir: PathBuf,
    files: Vec<FileMeta>,
}

impl Builder {
    /// chunks 落到 tmp_dir；chunk_cap 为每块行数。
    pub fn with_dir(tmp_dir: PathBuf, chunk_cap: usize) -> Self {
        Builder {
            chunk_rows: Vec::with_capacity(chunk_cap.min(1 << 20)),
            chunk_cap: chunk_cap.max(1 << 14),
            chunks: Vec::new(),
            tmp_dir,
            files: Vec::new(),
        }
    }

    pub fn push(&mut self, p: Posting) {
        if p.h > MAX_HASH {
            panic!("hash out of range: {:#x}", p.h);
        }
        self.chunk_rows.push(p);
        if self.chunk_rows.len() >= self.chunk_cap {
            self.flush_chunk().expect("flush chunk");
        }
    }

    pub fn push_batch(&mut self, rows: impl IntoIterator<Item = Posting>) {
        for p in rows {
            self.push(p);
        }
    }

    pub fn add_file(&mut self, meta: FileMeta) {
        self.files.push(meta);
    }

    fn flush_chunk(&mut self) -> std::io::Result<()> {
        if self.chunk_rows.is_empty() {
            return Ok(());
        }
        self.chunk_rows.sort_unstable_by_key(|p| p.h);
        let path = self.tmp_dir.join(format!("chunk_{}.bin", self.chunks.len()));
        let mut f = BufWriter::new(File::create(&path)?);
        for p in &self.chunk_rows {
            f.write_all(&p.to_bytes())?;
        }
        self.chunks.push(path);
        self.chunk_rows.clear();
        Ok(())
    }

    /// 完成写入 out 路径（.casi）。返回行数。
    pub fn finish(mut self, out: &Path) -> std::io::Result<u64> {
        self.flush_chunk()?;
        use std::io::{Seek, SeekFrom, Write as _};
        let mut f = BufWriter::new(File::create(out)?);

        // 1) 占位 header (128B) + 桶目录占位
        let mut header_buf = Vec::with_capacity(HEADER_LEN);
        Header::default().write_to(&mut header_buf);
        f.write_all(&header_buf)?;

        let dir_offset = HEADER_LEN as u64;
        f.write_all(&vec![0u8; BUCKET_COUNT as usize * 8])?;

        let postings_offset = dir_offset + BUCKET_COUNT as u64 * 8;
        let mut dir = vec![0u64; BUCKET_COUNT as usize];

        // 2) k 路归并流式写 postings，并记录桶起始
        let mut merge = MergeRuns::new(&self.chunks)?;
        let mut total_rows: u64 = 0;
        let mut prev_bucket: u64 = 0;
        for p in &mut merge {
            let bucket = (p.h >> 16) as u64;
            while prev_bucket < bucket {
                prev_bucket += 1;
                dir[prev_bucket as usize] = total_rows;
            }
            if total_rows == 0 {
                dir[0] = 0;
            }
            f.write_all(&p.to_bytes())?;
            total_rows += 1;
        }
        for b in prev_bucket + 1..BUCKET_COUNT as u64 {
            dir[b as usize] = total_rows;
        }
        dir[0] = 0;
        f.flush()?;

        // 3) 回填桶目录
        f.seek(SeekFrom::Start(dir_offset))?;
        for d in &dir {
            f.write_all(&d.to_le_bytes())?;
        }

        // 4) 文件段 + 字符串竞技场（追加在 postings 之后）
        let files_offset = postings_offset + total_rows * POSTING_LEN as u64;
        let mut arena: Vec<u8> = Vec::new();
        let mut file_bytes = Vec::with_capacity(self.files.len() * FILE_RECORD_LEN);
        self.files.sort_by_key(|m| m.fid);
        for m in &self.files {
            let name_off = arena.len() as u32;
            arena.extend_from_slice(m.name.as_bytes());
            let name_len = arena.len() as u32 - name_off;
            let path_off = arena.len() as u32;
            arena.extend_from_slice(m.path.as_bytes());
            let path_len = arena.len() as u32 - path_off;
            let mut rec = Vec::with_capacity(FILE_RECORD_LEN);
            rec.extend_from_slice(&m.fid.to_le_bytes());
            rec.extend_from_slice(&name_off.to_le_bytes());
            rec.extend_from_slice(&name_len.to_le_bytes());
            rec.extend_from_slice(&path_off.to_le_bytes());
            rec.extend_from_slice(&path_len.to_le_bytes());
            rec.extend_from_slice(&m.duration.to_le_bytes());
            rec.extend_from_slice(&m.status.to_le_bytes());
            debug_assert_eq!(rec.len(), FILE_RECORD_LEN);
            file_bytes.extend_from_slice(&rec);
        }
        let strings_offset = files_offset + file_bytes.len() as u64;
        let total_len = strings_offset + arena.len() as u64;

        f.seek(SeekFrom::Start(files_offset))?;
        f.write_all(&file_bytes)?;
        f.write_all(&arena)?;

        // 5) 回填 header
        let header = Header {
            file_count: self.files.len() as u64,
            hash_count: total_rows,
            bucket_count: BUCKET_COUNT,
            dir_offset,
            postings_offset,
            files_offset,
            strings_offset,
            strings_len: arena.len() as u64,
            total_len,
        };
        let mut hb = Vec::with_capacity(HEADER_LEN);
        header.write_to(&mut hb);
        f.seek(SeekFrom::Start(0))?;
        f.write_all(&hb)?;
        f.flush()?;
        Ok(total_rows)
    }
}

impl BuildData {
    pub fn new() -> Self {
        BuildData { rows: Vec::new(), files: Vec::new() }
    }
    pub fn add_posting(&mut self, h: u32, fid: u32, t: u32) {
        self.rows.push(Posting { h, fid, t });
    }
    pub fn add_file(&mut self, f: FileMeta) {
        self.files.push(f);
    }
    pub fn build_to(&self, out: &Path, tmp_dir: &Path, chunk_cap: usize) -> std::io::Result<u64> {
        let mut builder = Builder::with_dir(tmp_dir.to_path_buf(), chunk_cap);
        builder.push_batch(self.rows.iter().copied());
        for f in &self.files {
            builder.add_file(f.clone());
        }
        builder.finish(out)
    }
}

struct MergeRuns {
    heap: BinaryHeap<HeapItem>,
    readers: Vec<(BufReader<File>, Posting)>,
}

#[derive(PartialEq, Eq)]
struct HeapItem(Posting, usize);

impl Ord for HeapItem {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        other.0.h.cmp(&self.0.h).then_with(|| other.1.cmp(&self.1))
    }
}
impl PartialOrd for HeapItem {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl MergeRuns {
    fn new(chunks: &[PathBuf]) -> std::io::Result<Self> {
        let mut readers = Vec::with_capacity(chunks.len());
        let mut heap = BinaryHeap::new();
        for (i, p) in chunks.iter().enumerate() {
            let mut r = BufReader::new(File::open(p)?);
            let mut first = [0u8; POSTING_LEN];
            match r.read_exact(&mut first) {
                Ok(()) => {
                    let p = Posting::from_bytes(&first);
                    heap.push(HeapItem(p, i));
                }
                Err(e) if e.kind() == std::io::ErrorKind::UnexpectedEof => {}
                Err(e) => return Err(e),
            }
            readers.push((r, Posting { h: 0, fid: 0, t: 0 }));
        }
        Ok(MergeRuns { heap, readers })
    }
}

impl Iterator for MergeRuns {
    type Item = Posting;
    fn next(&mut self) -> Option<Posting> {
        let HeapItem(p, i) = self.heap.pop()?;
        let (r, slot) = &mut self.readers[i];
        let mut buf = [0u8; POSTING_LEN];
        match r.read_exact(&mut buf) {
            Ok(()) => {
                let next = Posting::from_bytes(&buf);
                *slot = next;
                self.heap.push(HeapItem(next, i));
            }
            Err(_) => {}
        }
        Some(p)
    }
}
