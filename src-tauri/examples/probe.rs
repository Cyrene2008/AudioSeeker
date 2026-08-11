//! probe.rs - 验证 ureq 能否正常从 gh-proxy.com 下载（对比浏览器行为）
fn main() {
    let url = std::env::args().nth(1).unwrap_or_else(|| {
        "https://gh-proxy.com/https://github.com/indygreg/python-build-standalone/releases/download/20241016/cpython-3.12.7+20241016-x86_64-pc-windows-msvc-shared-install_only.tar.gz".to_string()
    });
    let ua = std::env::args().nth(2).unwrap_or_else(|| "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36".to_string());

    let t0 = std::time::Instant::now();
    match ureq::get(&url)
        .set("User-Agent", &ua)
        .timeout(std::time::Duration::from_secs(30))
        .call()
    {
        Ok(resp) => {
            println!("HTTP {}  (TTFB {:.2}s)", resp.status(), t0.elapsed().as_secs_f32());
            let total = resp.header("Content-Length").unwrap_or("?").to_string();
            let mut src = resp.into_reader();
            let mut buf = [0u8; 65536];
            let mut got: u64 = 0;
            let t1 = std::time::Instant::now();
            let mut first_chunk = 0.0;
            loop {
                match src.read(&mut buf) {
                    Ok(0) | Err(_) => break,
                    Ok(n) => {
                        if got == 0 {
                            first_chunk = t1.elapsed().as_secs_f32();
                        }
                        got += n as u64;
                    }
                }
                if got > 5 * 1024 * 1024 {
                    break;
                }
            }
            println!("5MB 下载完成: {:.2}s (首个数据块 {:.2}s), Content-Length={total}",
                     t1.elapsed().as_secs_f32(), first_chunk);
        }
        Err(e) => println!("ERR: {e}"),
    }
}
