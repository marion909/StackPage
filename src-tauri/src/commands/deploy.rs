use serde::{Deserialize, Serialize};
use suppaftp::FtpStream;

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
    let addr = format!("{}:{}", config.host, config.port);
    
    let mut ftp = FtpStream::connect(&addr)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;
    
    ftp.login(&config.username, &config.password)
        .await
        .map_err(|e| format!("Login failed: {}", e))?;
    
    let _ = ftp.quit().await;
    
    Ok("Connection successful".to_string())
}

#[tauri::command]
pub async fn deploy_ftp(config: FtpConfig, local_path: String) -> Result<String, String> {
    use std::fs;
    use std::path::PathBuf;
    
    let addr = format!("{}:{}", config.host, config.port);
    
    let mut ftp = FtpStream::connect(&addr)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;
    
    ftp.login(&config.username, &config.password)
        .await
        .map_err(|e| format!("Login failed: {}", e))?;

    if config.passive {
        ftp.set_mode(suppaftp::Mode::Passive);
    } else {
        ftp.set_mode(suppaftp::Mode::Active);
    }

    let local_base = PathBuf::from(&local_path);
    let uploaded = upload_dir_ftp(&mut ftp, &local_base, &local_base, &config.remote_path).await?;
    
    let _ = ftp.quit().await;
    
    Ok(format!("Uploaded {} file(s) successfully", uploaded))
}

async fn upload_dir_ftp(
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
        let remote_path = format!("{}/{}", remote_base.trim_end_matches('/'), relative.to_string_lossy().replace('\\', "/"));
        
        if path.is_dir() {
            let _ = ftp.mkdir(&remote_path).await;
            count += Box::pin(upload_dir_ftp(ftp, base, &path, remote_base)).await?;
        } else {
            let content = fs::read(&path).map_err(|e| e.to_string())?;
            let mut cursor = std::io::Cursor::new(content);
            ftp.put_file(&remote_path, &mut cursor)
                .await
                .map_err(|e| format!("Failed to upload {}: {}", remote_path, e))?;
            count += 1;
        }
    }
    
    Ok(count)
}
