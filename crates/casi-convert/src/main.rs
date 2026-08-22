//! casi-convert - 将旧版 SQLite 索引目录转换为单一 .casi。
//!
//! 输入：含 shard_*.sqlite (+ shard_*.dat) 的目录（Python 版 build_index.py 产物）。
//! 输出：目录内 index.casi + index.json（文件清单，供增量检索/检索 enrichment）。
//!
//! 复用语义：
//! - fid 来自 sqlite files 表（(shard_id << 24) | rowid），与 .dat 写入一致
//! - .dat 行格式 (h:i32, fid:i32, t:i32) LE，与 fp_core.py 预载格式一致
//! - 无 .dat 时回退读 sqlite hashes 表（较慢）

use std::path::{Path, PathBuf};

use casi_index::{Builder, FileMeta, Posting};

fn list_shards(dir: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    if let Ok(rd) = std::fs::read_dir(dir) {
        for e in rd.flatten() {
            let p = e.path();
            if p.is_file() && p.file_name().and_then(|s| s.to_str()).map(|s| s.starts_with("shard_") && s.ends_with(".sqlite")).unwrap_or(false) {
                out.push(p);
            }
        }
    }
    out.sort();
    out
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("用法: casi-convert <索引目录> --out <目录>");
        std::process::exit(2);
    }
    let src = Path::new(&args[1]);
    let mut out = PathBuf::from("converted");
    if args.len() >= 4 {
        if let Some(pos) = args.iter().position(|a| a == "--out") {
            out = PathBuf::from(&args[pos + 1]);
        }
    }
    match convert(src, &out) {
        Ok((rows, files)) => {
            println!("转换完成: {rows} 行, {files} 文件 -> {}", out.join("index.casi").display());
        }
        Err(e) => {
            eprintln!("转换失败: {e}");
            std::process::exit(1);
        }
    }
}

fn convert(src: &Path, out: &Path) -> Result<(u64, usize), String> {
    fn s(x: String) -> String { x }
    let shards = list_shards(src);
    if shards.is_empty() {
        return Err(format!("{} 下没有 shard_*.sqlite", src.display()));
    }
    std::fs::create_dir_all(out).map_err(|e| e.to_string())?;
    let tmp = tempfile::Builder::new().prefix("casi_convert_").tempdir().map_err(|e| e.to_string())?;
    let mut b = Builder::with_dir(tmp.path().to_path_buf(), 2_000_000);

    let mut file_count = 0usize;
    for sp in &shards {
        let base = sp.with_extension("dat");
        let has_dat = base.exists() && std::fs::metadata(&base).map(|m| m.len() > 0).unwrap_or(false);
        // files 表
        let con = rusqlite::Connection::open(sp).map_err(|e| format!("{}: {}", sp.display(), s(e.to_string())))?;
        let mut stmt = con
            .prepare("SELECT fid, name, path, duration, status FROM files")
            .map_err(|e| format!("{}", s(e.to_string())))?;
        let rows: Vec<(u32, String, String, f64, u32)> = stmt
            .query_map([], |r| {
                Ok((
                    r.get::<_, i64>(0)? as u32,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, f64>(3)?,
                    r.get::<_, i64>(4)? as u32,
                ))
            })
            .map_err(|e| format!("{}", s(e.to_string())))?
            .filter_map(|r| r.ok())
            .collect();
        for (fid, name, path, duration, status) in rows {
            b.add_file(FileMeta { fid, name, path, duration, status });
            file_count += 1;
        }
        drop(stmt);

        if has_dat {
            drop(con);
            let data = std::fs::read(&base).map_err(|e| format!("{}: {e}", base.display()))?;
            let rows_n = data.len() / 12;
            let mut i = 0usize;
            let mut buf = [0u8; 12];
            while i < rows_n {
                buf.copy_from_slice(&data[i * 12..i * 12 + 12]);
                let h = i32::from_le_bytes(buf[0..4].try_into().unwrap()) as u32;
                let fid = i32::from_le_bytes(buf[4..8].try_into().unwrap()) as u32;
                let t = i32::from_le_bytes(buf[8..12].try_into().unwrap()) as u32;
                b.push(Posting { h, fid, t });
                i += 1;
            }
        } else {
            let con = rusqlite::Connection::open(sp).map_err(|e| format!("{}", s(e.to_string())))?;
            let mut stmt = con
                .prepare("SELECT h, fid, t FROM hashes")
                .map_err(|e| format!("{}", s(e.to_string())))?;
            let mut it = stmt.query([]).map_err(|e| format!("{}", s(e.to_string())))?;
            while let Some(row) = it.next().map_err(|e| format!("{}", s(e.to_string())))? {
                let h = row.get::<_, i64>(0).map_err(|e| format!("{}", s(e.to_string())))? as u32;
                let fid = row.get::<_, i64>(1).map_err(|e| format!("{}", s(e.to_string())))? as u32;
                let t = row.get::<_, i64>(2).map_err(|e| format!("{}", s(e.to_string())))? as u32;
                b.push(Posting { h, fid, t });
            }
        }
        println!("shard 完成: {}", sp.display());
    }

    let rows = b.finish(&out.join("index.casi")).map_err(|e| e.to_string())?;
    let manifest = serde_json::json!({
        "schema": 1,
        "converted_from": src.display().to_string(),
        "shards": shards.iter().map(|s| s.display().to_string()).collect::<Vec<_>>(),
        "file_count": file_count,
        "hash_count": rows,
    });
    std::fs::write(out.join("index.json"), serde_json::to_string_pretty(&manifest).unwrap())
        .map_err(|e| e.to_string())?;
    Ok((rows, file_count))
}
