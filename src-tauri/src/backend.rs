//! backend.rs - Python 运行时引导与后端进程管理。
//!
//! 启动流程（全程隐藏命令行窗口）：
//!   1. 定位 ./env/python.exe，不存在则下载 python-build-standalone 并解压
//!   2. 确保 pip，然后 pip install -r requirements.txt（大陆走 tuna 镜像）
//!   3. 检查 ffmpeg，缺失则下载 BtbN 构建并解压到 ./ffmpeg/
//!   4. 以 CREATE_NO_WINDOW 启动 backend/server.py，等待 /api/health

use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::Manager;

const CREATE_NO_WINDOW: u32 = 0x0800_0000;
const DEFAULT_PORT: u16 = 8765;
const PYTHON_CANDIDATES: &[(&str, &str)] = &[
    ("20241016", "cpython-3.12.7+20241016-x86_64-pc-windows-msvc-shared-install_only.tar.gz"),
    ("20241016", "cpython-3.11.9+20241016-x86_64-pc-windows-msvc-shared-install_only.tar.gz"),
    ("20240224", "cpython-3.10.13+20240224-x86_64-pc-windows-msvc-shared-install_only.tar.gz"),
];
const PYTHON_GITHUB: &str = "https://github.com/indygreg/python-build-standalone/releases/download";
/// 清华 TUNA 镜像的 python.org 官方文件（embeddable zip 纯解压零窗口；exe 安装包为后备）
const TUNA_PYTHON_CANDIDATES: &[(&str, &str, &str)] = &[
    ("3.12.7", "python-3.12.7-embed-amd64.zip", "python-3.12.7-amd64.exe"),
    ("3.11.9", "python-3.11.9-embed-amd64.zip", "python-3.11.9-amd64.exe"),
];

const TUNA_PYPI: &str = "https://pypi.tuna.tsinghua.edu.cn/simple";
const ALIYUN_PYPI: &str = "https://mirrors.aliyun.com/pypi/simple/";
const GET_PIP_URL: &str = "https://bootstrap.pypa.io/get-pip.py";
const FFMPEG_URL: &str = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip";

#[derive(Clone, Serialize, Default, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Phase {
    #[default]
    Starting,
    DownloadingPython,
    ExtractingPython,
    InstallingPip,
    InstallingDeps,
    CheckingFfmpeg,
    DownloadingFfmpeg,
    ExtractingFfmpeg,
    StartingBackend,
    Ready,
    Error,
}

#[derive(Clone, Serialize, Default)]
pub struct BootState {
    pub phase: Phase,
    pub detail: String,
    pub progress: f32,
    pub port: u16,
    pub ready: bool,
    pub error: String,
}

static STATE: OnceLock<Mutex<BootState>> = OnceLock::new();
static CHILD: OnceLock<Mutex<Option<Child>>> = OnceLock::new();

pub fn state() -> &'static Mutex<BootState> {
    STATE.get_or_init(|| Mutex::new(BootState::default()))
}

fn child_slot() -> &'static Mutex<Option<Child>> {
    CHILD.get_or_init(|| Mutex::new(None))
}

fn set_phase(p: Phase, detail: impl Into<String>) {
    let is_err = p == Phase::Error;
    if let Ok(mut s) = state().lock() {
        s.phase = p;
        s.detail = detail.into();
        if is_err {
            s.error = s.detail.clone();
        }
    }
}

fn set_progress(p: f32, detail: impl Into<String>) {
    if let Ok(mut s) = state().lock() {
        s.progress = p;
        s.detail = detail.into();
    }
}

/// Windows 下隐藏命令行窗口（全程不可见）。
fn hide_window(cmd: &mut Command) -> &mut Command {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(CREATE_NO_WINDOW)
    }
    #[cfg(not(windows))]
    {
        let _ = cmd;
        unreachable!("仅支持 Windows")
    }
}

// ---------- 路径 ----------

fn app_dirs(app: &tauri::AppHandle) -> (PathBuf, PathBuf) {
    let app_dir = app.path().app_config_dir().unwrap_or_else(|_| {
        std::env::current_exe().unwrap_or_default().parent().unwrap_or(Path::new(".")).to_path_buf()
    });
    let exe_dir = std::env::current_exe()
        .unwrap_or_default()
        .parent()
        .unwrap_or(Path::new("."))
        .to_path_buf();
    (exe_dir, app_dir)
}

/// 定位 backend 目录（打包资源 / 开发目录）。
fn backend_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    let mut cands: Vec<PathBuf> = Vec::new();
    if let Ok(rd) = app.path().resource_dir() {
        cands.push(rd.join("backend"));
    }
    let exe_dir = std::env::current_exe()
        .unwrap_or_default()
        .parent()
        .unwrap_or(Path::new("."))
        .to_path_buf();
    cands.push(exe_dir.join("backend"));
    cands.push(PathBuf::from("src-tauri").join("resources").join("backend"));
    cands.into_iter().find(|p| p.join("server.py").is_file())
}

fn free_port() -> u16 {
    TcpListener::bind(("127.0.0.1", 0))
        .map(|l| l.local_addr().map(|a| a.port()).unwrap_or(DEFAULT_PORT))
        .unwrap_or(DEFAULT_PORT)
}

fn port_in_use(port: u16) -> bool {
    TcpListener::bind(("127.0.0.1", port)).is_err()
}

fn is_cn_environment() -> bool {
    let locale = std::env::var("LANG").unwrap_or_default();
    if locale.contains("zh_CN") || locale.contains("zh-CN") {
        return true;
    }
    // GitHub API 超时视为大陆网络环境
    ureq::get("https://api.github.com/rate_limit")
        .set("User-Agent", "CyreneAudioSeeker")
        .timeout(Duration::from_secs(6))
        .call()
        .is_err()
}

// ---------- 下载与解压 ----------

/// 判定"下载几乎无速度"的阈值：15 秒内收到的字节数低于此值才切换镜像
/// （给 gh-proxy 冷启动留足时间，避免误判）
const SPEED_CHECK_SECS: u64 = 15;
const SPEED_CHECK_MIN_BYTES: u64 = 64 * 1024;

/// GitHub 加速镜像列表（依次尝试），原地址最后兜底
const GH_PROXIES: &[&str] = &[
    "https://gh-proxy.com/",
    "https://gh-proxy.net/",
    "https://ghfast.top/",
    "https://mirror.ghproxy.com/",
];

/// 伪装浏览器 UA：gh-proxy 等镜像站会拦截非浏览器请求（Cloudflare 人机验证）
const BROWSER_UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

fn download(url: &str, dest: &Path, progress_label: impl Fn(u64, u64)) -> Result<(), String> {
    if let Some(parent) = dest.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let resp = ureq::get(url)
        .set("User-Agent", BROWSER_UA)
        .timeout(Duration::from_secs(600))
        .call()
        .map_err(|e| format!("下载失败 {url}: {e}"))?;
    let total = resp.header("Content-Length")
        .and_then(|v| v.parse::<u64>().ok())
        .unwrap_or(0);
    let mut src = resp.into_reader();
    let mut f = std::fs::File::create(dest).map_err(|e| e.to_string())?;
    let mut buf = [0u8; 65536];
    let mut got: u64 = 0;
    let start = Instant::now();
    loop {
        let n = src.read(&mut buf).map_err(|e| e.to_string())?;
        if n == 0 {
            break;
        }
        f.write_all(&buf[..n]).map_err(|e| e.to_string())?;
        got += n as u64;
        progress_label(got, total);
        // 速度检查：超时仍收不到最低字节数 → 判为无速度
        if got < SPEED_CHECK_MIN_BYTES && start.elapsed() > Duration::from_secs(SPEED_CHECK_SECS) {
            return Err(format!("下载速度过慢: {url}"));
        }
    }
    Ok(())
}

/// 依次尝试多个 URL（多镜像 → 原地址兜底），速度过慢自动切换。
fn download_with_fallback(urls: &[String], dest: &Path,
                          progress_label: impl Fn(u64, u64) + Copy) -> Result<(), String> {
    let mut last_err = String::new();
    for (i, url) in urls.iter().enumerate() {
        if i > 0 {
            set_progress(0.0, format!("镜像失败，尝试下一个源: {url}"));
        } else {
            set_progress(0.0, format!("开始下载: {url}"));
        }
        match download(url, dest, progress_label) {
            Ok(()) => return Ok(()),
            Err(e) => {
                last_err = e;
                let _ = std::fs::remove_file(dest);
            }
        }
    }
    Err(last_err)
}

/// 构造 [多镜像, 原地址] 的候选 URL 列表。
fn github_candidates(original: &str) -> Vec<String> {
    let mut v: Vec<String> = GH_PROXIES
        .iter()
        .map(|p| format!("{p}{original}"))
        .collect();
    v.push(original.to_string());
    v
}

fn extract_tar_gz(archive: &Path, dest: &Path) -> Result<(), String> {
    let f = std::fs::File::open(archive).map_err(|e| e.to_string())?;
    let gz = flate2::read::GzDecoder::new(f);
    let mut tar = tar::Archive::new(gz);
    tar.unpack(dest).map_err(|e| e.to_string())?;
    // install_only 包解压后内容在 python/ 子目录，平铺到 dest
    let inner = dest.join("python");
    if inner.is_dir() {
        let tmp = dest.with_extension("tmp_python");
        let _ = std::fs::rename(&inner, &tmp);
        for entry in std::fs::read_dir(&tmp).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let target = dest.join(entry.file_name());
            let _ = std::fs::remove_dir_all(&target);
            let _ = std::fs::remove_file(&target);
            std::fs::rename(entry.path(), target).map_err(|e| e.to_string())?;
        }
        let _ = std::fs::remove_dir_all(&tmp);
    }
    Ok(())
}

/// 解压 zip 的全部内容到 dest。
fn extract_zip_all(archive: &Path, dest: &Path) -> Result<(), String> {
    let f = std::fs::File::open(archive).map_err(|e| e.to_string())?;
    let mut z = zip::ZipArchive::new(f).map_err(|e| e.to_string())?;
    for i in 0..z.len() {
        let mut entry = z.by_index(i).map_err(|e| e.to_string())?;
        let name = entry.name().to_string().replace('\\', "/");
        let target = dest.join(&name);
        if name.ends_with('/') {
            std::fs::create_dir_all(&target).map_err(|e| e.to_string())?;
            continue;
        }
        if let Some(parent) = target.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let mut out = std::fs::File::create(&target).map_err(|e| e.to_string())?;
        std::io::copy(&mut entry, &mut out).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// 修补 embeddable python 的 ._pth：启用 site + site-packages（否则 pip 无法使用）
fn patch_embeddable_pth(env_dir: &Path, ver: &str) -> Result<(), String> {
    let parts: Vec<&str> = ver.split('.').collect();
    if parts.len() < 2 {
        return Ok(());
    }
    let pth = env_dir.join(format!("python{}{}._pth", parts[0], parts[1]));
    if !pth.is_file() {
        return Ok(());
    }
    let content = std::fs::read_to_string(&pth).map_err(|e| e.to_string())?;
    let mut lines: Vec<String> = content.lines().map(|s| s.to_string()).collect();
    let mut changed = false;
    if !lines.iter().any(|l| l.trim() == "Lib\\site-packages") {
        // 在 "." 之后插入 site-packages 路径
        if let Some(idx) = lines.iter().position(|l| l.trim() == ".") {
            lines.insert(idx + 1, "Lib\\site-packages".to_string());
            changed = true;
        }
    }
    for l in lines.iter_mut() {
        if l.trim() == "#import site" {
            *l = "import site".to_string();
            changed = true;
        }
    }
    if changed {
        std::fs::write(&pth, lines.join("\n") + "\n").map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn extract_ffmpeg_zip(archive: &Path, dest: &Path) -> Result<(), String> {
    let f = std::fs::File::open(archive).map_err(|e| e.to_string())?;
    let mut z = zip::ZipArchive::new(f).map_err(|e| e.to_string())?;
    let bin = dest.join("bin");
    std::fs::create_dir_all(&bin).map_err(|e| e.to_string())?;
    for i in 0..z.len() {
        let mut entry = z.by_index(i).map_err(|e| e.to_string())?;
        let name = entry.name().to_string();
        let base = name.rsplit('/').next().unwrap_or("");
        if base == "ffmpeg.exe" || base == "ffprobe.exe" {
            let mut out = std::fs::File::create(bin.join(base)).map_err(|e| e.to_string())?;
            std::io::copy(&mut entry, &mut out).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

// ---------- 引导 ----------

fn locate_python(app_dir: &Path, exe_dir: &Path) -> (PathBuf, bool) {
    let env_dir = exe_dir.join("env");
    let py = env_dir.join("python.exe");
    if py.is_file() {
        return (py, true);
    }
    let py2 = app_dir.join("env").join("python.exe");
    if py2.is_file() {
        return (py2, true);
    }
    (env_dir.join("python.exe"), false)
}

fn ensure_python(_cn: bool, app_dir: &Path, exe_dir: &Path) -> Result<PathBuf, String> {
    let (py, exists) = locate_python(app_dir, exe_dir);
    if exists {
        return Ok(py);
    }
    let env_dir = py.parent().unwrap_or(exe_dir).to_path_buf();
    std::fs::create_dir_all(&env_dir).map_err(|e| e.to_string())?;

    // 方案一（优先）：清华 TUNA 镜像的 embeddable zip（纯解压零窗口）
    set_phase(Phase::DownloadingPython, "下载 Python 运行时（清华镜像）");
    let mut last_err = String::from("Python 安装失败");
    for (ver, zip_asset, exe_asset) in TUNA_PYTHON_CANDIDATES {
        // 1a) embeddable zip：解压 + 修补 _pth，完全无窗口
        let zip_url = format!(
            "https://mirrors.tuna.tsinghua.edu.cn/python/{ver}/{zip_asset}");
        let tmp_zip = env_dir.join(format!("python_embed_{ver}.zip"));
        if download(&zip_url, &tmp_zip, |got, total| {
            let p = if total > 0 { got as f32 / total as f32 } else { 0.0 };
            set_progress(p * 0.5, format!("下载 Python ({got}/{total} 字节)"));
        }).is_ok() {
            set_phase(Phase::ExtractingPython, "解压 Python 运行时");
            match extract_zip_all(&tmp_zip, &env_dir) {
                Ok(()) => {
                    let _ = std::fs::remove_file(&tmp_zip);
                    let _ = patch_embeddable_pth(&env_dir, ver);
                    if py.is_file() {
                        return Ok(py);
                    }
                }
                Err(e) => last_err = e,
            }
        }

        // 1b) 回退：官方 exe 安装包静默安装（个别系统会闪窗，故作为后备）
        let exe_url = format!(
            "https://mirrors.tuna.tsinghua.edu.cn/python/{ver}/{exe_asset}");
        let tmp_exe = env_dir.join(format!("python_setup_{ver}.exe"));
        if download(&exe_url, &tmp_exe, |got, total| {
            let p = if total > 0 { got as f32 / total as f32 } else { 0.0 };
            set_progress(p * 0.6, format!("下载 Python ({got}/{total} 字节)"));
        }).is_ok() {
            set_phase(Phase::ExtractingPython, "静默安装 Python 运行时");
            let mut cmd = Command::new(&tmp_exe);
            cmd.args([
                "/quiet", "InstallAllUsers=0", "PrependPath=0",
                "Include_launcher=0", "Include_test=0", "Include_doc=0",
                "Include_tcltk=0", "Include_pip=1",
                "TargetDir=", env_dir.to_str().unwrap_or(""),
            ]);
            hide_window(&mut cmd);
            let _ = cmd.status();
            let _ = std::fs::remove_file(&tmp_exe);
            for _ in 0..90 {
                if py.is_file() {
                    return Ok(py);
                }
                std::thread::sleep(Duration::from_secs(1));
            }
            last_err = format!("静默安装超时（{ver}）");
        }
    }

    // 方案二（回退）：python-build-standalone tar.gz（多镜像 → 原地址）
    set_phase(Phase::DownloadingPython, "下载 Python 运行时（镜像回退）");
    let tmp = env_dir.join("python_runtime.tar.gz");
    let mut downloaded = false;
    for (tag, asset) in PYTHON_CANDIDATES {
        let direct = format!("{PYTHON_GITHUB}/{tag}/{asset}");
        let urls = github_candidates(&direct);
        match download_with_fallback(&urls, &tmp, |got, total| {
            let p = if total > 0 { got as f32 / total as f32 } else { 0.0 };
            set_progress(p * 0.6, format!("下载 Python ({got}/{total} 字节)"));
        }) {
            Ok(()) => {
                downloaded = true;
                break;
            }
            Err(e) => {
                last_err = e;
                let _ = std::fs::remove_file(&tmp);
            }
        }
    }
    if !downloaded {
        return Err(format!("Python 下载失败: {last_err}（请检查网络）"));
    }
    set_phase(Phase::ExtractingPython, "解压 Python 运行时");
    extract_tar_gz(&tmp, &env_dir).map_err(|e| e.to_string())?;
    let _ = std::fs::remove_file(&tmp);
    if !py.is_file() {
        return Err("Python 解压后未找到 python.exe".into());
    }
    Ok(py)
}

fn ensure_pip(py: &Path) -> Result<(), String> {
    let mut cmd = Command::new(py);
    cmd.args(["-m", "pip", "--version"])
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    hide_window(&mut cmd);
    let ok = cmd.status().map(|s| s.success()).unwrap_or(false);
    if ok {
        return Ok(());
    }
    set_phase(Phase::InstallingPip, "安装 pip");
    let get_pip = py.parent().unwrap().join("get-pip.py");
    download(GET_PIP_URL, &get_pip, |_, _| {})?;
    let mut cmd = Command::new(py);
    cmd.arg(&get_pip)
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    hide_window(&mut cmd);
    let status = cmd.status().map_err(|e| e.to_string())?;
    let _ = std::fs::remove_file(&get_pip);
    if !status.success() {
        return Err("pip 安装失败".into());
    }
    Ok(())
}

fn deps_ok(py: &Path) -> bool {
    let check = "import fastapi,uvicorn,librosa,soundfile,numpy,scipy";
    let mut cmd = Command::new(py);
    cmd.args(["-c", check])
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    hide_window(&mut cmd);
    cmd.status().map(|s| s.success()).unwrap_or(false)
}

fn install_deps(_cn: bool, py: &Path, backend: &Path) -> Result<(), String> {
    set_phase(Phase::InstallingDeps, "安装 Python 依赖");
    let req = backend.join("requirements.txt");
    if !req.is_file() {
        return Err("requirements.txt 不存在".into());
    }
    // 镜像无条件优先（参考 QwenTTS：阿里云镜像默认），pypi.org 最后兜底。
    // CN 探测不可靠（Windows 无 LANG），若先走 pypi.org 会因"慢而不失败"一直龟速。
    let indexes: [&str; 3] = [TUNA_PYPI, ALIYUN_PYPI, "https://pypi.org/simple"];
    let mut last_err = String::from("依赖安装失败");
    for idx in indexes {
        let mut cmd = Command::new(py);
        cmd.args(["-m", "pip", "install", "-r", req.to_str().unwrap(),
                  "-i", idx, "--timeout", "30", "--retries", "2",
                  "--disable-pip-version-check"])
            .stdout(Stdio::null())
            .stderr(Stdio::null());
        hide_window(&mut cmd);
        match cmd.status() {
            Ok(s) if s.success() => return Ok(()),
            Ok(_) => last_err = format!("pip 安装失败（{idx}）"),
            Err(e) => last_err = format!("pip 执行失败: {e}"),
        }
    }
    Err(last_err)
}

fn ensure_ffmpeg(_cn: bool, exe_dir: &Path) -> Result<Option<PathBuf>, String> {
    set_phase(Phase::CheckingFfmpeg, "检查 ffmpeg");
    let probe = Command::new("ffmpeg")
        .arg("-version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
    if probe.map(|s| s.success()).unwrap_or(false) {
        return Ok(None);
    }
    let bin = exe_dir.join("ffmpeg").join("bin");
    let exe = bin.join("ffmpeg.exe");
    if exe.is_file() {
        let ok = Command::new(&exe)
            .arg("-version")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false);
        if ok {
            return Ok(Some(bin));
        }
    }
    set_phase(Phase::DownloadingFfmpeg, "下载 ffmpeg");
    std::fs::create_dir_all(&bin).map_err(|e| e.to_string())?;
    let tmp = exe_dir.join("ffmpeg_tmp.zip");
    let urls = github_candidates(FFMPEG_URL);
    download_with_fallback(&urls, &tmp, |got, total| {
        let p = if total > 0 { got as f32 / total as f32 } else { 0.0 };
        set_progress(p * 0.8, format!("下载 ffmpeg ({got}/{total} 字节)"));
    })?;
    set_phase(Phase::ExtractingFfmpeg, "解压 ffmpeg");
    extract_ffmpeg_zip(&tmp, &exe_dir.join("ffmpeg"))?;
    let _ = std::fs::remove_file(&tmp);
    if !exe.is_file() {
        return Err("ffmpeg 解压后未找到 ffmpeg.exe".into());
    }
    Ok(Some(bin))
}

/// 通过 netstat 找到占用指定端口的 PID 并树杀（只杀占用该端口的残留后端进程）
fn kill_process_on_port(port: u16) {
    let out = match Command::new("netstat")
        .args(["-ano", "-p", "tcp"])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
    {
        Ok(o) => o,
        Err(_) => return,
    };
    let text = String::from_utf8_lossy(&out.stdout);
    let mut pids = std::collections::HashSet::new();
    for line in text.lines() {
        if line.contains(&format!(":{port}")) && line.contains("LISTENING") {
            if let Some(pid) = line.split_whitespace().last() {
                if let Ok(pid) = pid.parse::<u32>() {
                    pids.insert(pid);
                }
            }
        }
    }
    for pid in pids {
        let mut cmd = Command::new("taskkill");
        cmd.args(["/PID", &pid.to_string(), "/T", "/F"])
            .stdout(Stdio::null())
            .stderr(Stdio::null());
        hide_window(&mut cmd);
        let _ = cmd.status();
    }
}

fn start_backend(py: &Path, backend: &Path, port: u16, app_dir: &Path,
                 data_dir: &Path, ffmpeg_bin: Option<&Path>) -> Result<Child, String> {
    set_phase(Phase::StartingBackend, "启动后端服务");
    let server = backend.join("server.py");
    let mut cmd = Command::new(py);
    cmd.arg(&server)
        .env("CYRENE_PORT", port.to_string())
        .env("CYRENE_APP_DIR", app_dir.to_str().unwrap_or(""))
        .env("CYRENE_DATA_DIR", data_dir.to_str().unwrap_or(""))
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    hide_window(&mut cmd);
    if let Some(bin) = ffmpeg_bin {
        let path = std::env::var("PATH").unwrap_or_default();
        cmd.env("PATH", format!("{};{}", bin.to_str().unwrap_or(""), path));
    }
    cmd.spawn().map_err(|e| format!("后端进程启动失败: {e}"))
}

pub fn run_bootstrap(app: &tauri::AppHandle) {
    let (exe_dir, app_dir) = app_dirs(app);
    let data_dir = app_dir.join("data");
    let _ = std::fs::create_dir_all(&data_dir);
    let backend = match backend_dir(app) {
        Some(b) => b,
        None => {
            set_phase(Phase::Error, "未找到 backend 目录");
            return;
        }
    };
    let cn = is_cn_environment();

    // 端口：默认 8765。占用时先做健康检查并比对版本：
    //   版本一致 → 复用；不一致 → 杀掉残留旧后端（netstat 定位 PID）后重新启动
    let port = if port_in_use(DEFAULT_PORT) {
        let health_url = format!("http://127.0.0.1:{DEFAULT_PORT}/api/health");
        let stale = match ureq::get(&health_url).timeout(Duration::from_secs(2)).call() {
            Ok(resp) if resp.status() == 200 => {
                let body = resp.into_string().unwrap_or_default();
                !body.contains(env!("CARGO_PKG_VERSION"))
            }
            _ => true,
        };
        if !stale {
            DEFAULT_PORT
        } else {
            kill_process_on_port(DEFAULT_PORT);
            free_port()
        }
    } else {
        DEFAULT_PORT
    };

    let result: Result<Child, String> = (|| {
        let py = ensure_python(cn, &app_dir, &exe_dir)?;
        ensure_pip(&py)?;
        if !deps_ok(&py) {
            install_deps(cn, &py, &backend)?;
        }
        let ffmpeg_bin = ensure_ffmpeg(cn, &exe_dir)?;
        start_backend(&py, &backend, port, &app_dir, &data_dir, ffmpeg_bin.as_deref())
    })();

    let mut child = match result {
        Ok(c) => c,
        Err(e) => {
            set_phase(Phase::Error, e.clone());
            if let Ok(mut s) = state().lock() {
                s.error = e;
            }
            return;
        }
    };

    // 等待健康检查
    let url = format!("http://127.0.0.1:{port}/api/health");
    let deadline = Instant::now() + Duration::from_secs(60);
    while Instant::now() < deadline {
        if let Ok(resp) = ureq::get(&url).timeout(Duration::from_secs(2)).call() {
            if resp.status() == 200 {
                if let Ok(mut s) = state().lock() {
                    s.phase = Phase::Ready;
                    s.port = port;
                    s.ready = true;
                    s.detail = "后端就绪".into();
                }
                if let Ok(mut slot) = child_slot().lock() {
                    *slot = Some(child);
                }
                return;
            }
        }
        if let Some(_status) = child.try_wait().ok().flatten() {
            break;
        }
        std::thread::sleep(Duration::from_millis(300));
    }
    // 超时或进程退出
    let _ = child.kill();
    set_phase(Phase::Error, "后端服务启动超时");
}

/// 退出时杀掉后端进程树（含其派生的 build/ffmpeg 子进程）。
/// 只杀本应用启动的进程，不碰用户其他 Python 程序。
pub fn backend_kill() {
    if let Ok(mut slot) = child_slot().lock() {
        if let Some(mut c) = slot.take() {
            let pid = c.id();
            let _ = c.kill();
            let _ = c.wait();
            #[cfg(windows)]
            {
                // 树杀：确保 uvicorn 派生的 build_index.py / ffmpeg 一并退出
                let _ = Command::new("taskkill")
                    .args(["/PID", &pid.to_string(), "/T", "/F"])
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .status();
            }
        }
    }
}

// ---------- Tauri 命令 ----------

#[tauri::command]
pub fn backend_status() -> BootState {
    state().lock().map(|g| g.clone()).unwrap_or_else(|e| e.into_inner().clone())
}

#[tauri::command]
pub fn app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// 后台执行引导（setup 时调用），完成后持有后端子进程。
pub fn setup(app: &tauri::AppHandle) {
    let handle = app.clone();
    std::thread::spawn(move || {
        run_bootstrap(&handle);
    });
}
