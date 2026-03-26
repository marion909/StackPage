use serde::{Deserialize, Serialize};
use suppaftp::FtpStream;
use suppaftp::Mode;

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FtpConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub passive: bool,
    pub remote_path: String,
}

#[tauri::command]
pub async fn test_ftp_connection(config: FtpConfig) -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        let addr = format!("{}:{}", config.host, config.port);
        let mut ftp = FtpStream::connect(&addr)
            .map_err(|e| format!("Connection failed: {}", e))?;
        ftp.login(&config.username, &config.password)
            .map_err(|e| format!("Login failed: {}", e))?;
        let _ = ftp.quit();
        Ok::<String, String>("Connection successful".to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn deploy_ftp(config: FtpConfig, local_path: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        let addr = format!("{}:{}", config.host, config.port);
        let mut ftp = FtpStream::connect(&addr)
            .map_err(|e| format!("Connection failed: {}", e))?;
        ftp.login(&config.username, &config.password)
            .map_err(|e| format!("Login failed: {}", e))?;
        if config.passive {
            ftp.set_mode(Mode::Passive);
        } else {
            ftp.set_mode(Mode::Active);
        }
        let base = std::path::PathBuf::from(&local_path);
        let count = upload_dir_ftp_sync(&mut ftp, &base, &base, &config.remote_path)?;
        let _ = ftp.quit();
        Ok::<String, String>(format!("Uploaded {} file(s) successfully", count))
    })
    .await
    .map_err(|e| e.to_string())?
}

fn upload_dir_ftp_sync(
    ftp: &mut FtpStream,
    base: &std::path::Path,
    dir: &std::path::Path,
    remote_base: &str,
) -> Result<usize, String> {
    use std::fs;
    let mut count = 0;
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries.flatten() {
        let path = entry.path();
        let relative = path.strip_prefix(base).map_err(|e| e.to_string())?;
        let remote_path = format!(
            "{}/{}",
            remote_base.trim_end_matches('/'),
            relative.to_string_lossy().replace('\\', "/")
        );
        if path.is_dir() {
            let _ = ftp.mkdir(&remote_path); // ignore "already exists" errors
            count += upload_dir_ftp_sync(ftp, base, &path, remote_base)?;
        } else {
            let content = fs::read(&path).map_err(|e| e.to_string())?;
            let mut cursor = std::io::Cursor::new(content);
            ftp.put_file(&remote_path, &mut cursor)
                .map_err(|e| format!("Failed to upload {}: {}", remote_path, e))?;
            count += 1;
        }
    }
    Ok(count)
}

