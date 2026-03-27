use serde::{Deserialize, Serialize};
use suppaftp::FtpStream;
use suppaftp::Mode;
use russh::client;
use russh_sftp::client::SftpSession;
use std::sync::Arc;

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

// ─── SFTP / SSH Deploy ────────────────────────────────────────────────────────

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SftpConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub remote_path: String,
}

// Minimal SSH client handler — accepts any host key (trust-on-first-use).
struct SshClient;

#[async_trait::async_trait]
impl client::Handler for SshClient {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &russh_keys::key::PublicKey,
    ) -> Result<bool, russh::Error> {
        Ok(true)
    }
}

#[tauri::command]
pub async fn test_sftp_connection(config: SftpConfig) -> Result<String, String> {
    let cfg = Arc::new(client::Config::default());
    let mut session = client::connect(cfg, (config.host.as_str(), config.port), SshClient)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;

    let ok = session
        .authenticate_password(&config.username, &config.password)
        .await
        .map_err(|e| format!("Authentication error: {}", e))?;

    if !ok {
        return Err("Authentication failed: invalid credentials".to_string());
    }

    let _ = session
        .disconnect(russh::Disconnect::ByApplication, "", "English")
        .await;

    Ok("Connection and authentication successful".to_string())
}

#[tauri::command]
pub async fn deploy_sftp(config: SftpConfig, local_path: String) -> Result<String, String> {
    let cfg = Arc::new(client::Config::default());
    let mut session = client::connect(cfg, (config.host.as_str(), config.port), SshClient)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;

    let ok = session
        .authenticate_password(&config.username, &config.password)
        .await
        .map_err(|e| format!("Authentication error: {}", e))?;

    if !ok {
        return Err("Authentication failed: invalid credentials".to_string());
    }

    let channel = session
        .channel_open_session()
        .await
        .map_err(|e| format!("Channel error: {}", e))?;

    channel
        .request_subsystem(true, "sftp")
        .await
        .map_err(|e| format!("SFTP subsystem error: {}", e))?;

    let sftp = SftpSession::new(channel.into_stream())
        .await
        .map_err(|e| format!("SFTP session error: {}", e))?;

    let base = std::path::PathBuf::from(&local_path);
    let count = upload_dir_sftp(&sftp, &base, &base, &config.remote_path).await?;

    let _ = session
        .disconnect(russh::Disconnect::ByApplication, "", "English")
        .await;

    Ok(format!("Uploaded {} file(s) via SFTP successfully", count))
}

fn upload_dir_sftp<'a>(
    sftp: &'a SftpSession,
    base: &'a std::path::Path,
    dir: &'a std::path::Path,
    remote_dir: &'a str,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<usize, String>> + Send + 'a>> {
    Box::pin(async move {
        let _ = sftp.create_dir(remote_dir).await; // ignore "already exists"

        let entries = std::fs::read_dir(dir).map_err(|e| e.to_string())?;
        let mut count = 0usize;

        for entry in entries.flatten() {
            let path = entry.path();
            let relative = path.strip_prefix(base).map_err(|e| e.to_string())?;
            let remote_path = format!(
                "{}/{}",
                remote_dir.trim_end_matches('/'),
                relative.to_string_lossy().replace('\\', "/")
            );

            if path.is_dir() {
                count += upload_dir_sftp(sftp, base, &path, &remote_path).await?;
            } else {
                use tokio::io::AsyncWriteExt;
                let content = tokio::fs::read(&path).await.map_err(|e| e.to_string())?;
                let mut remote_file = sftp
                    .create(&remote_path)
                    .await
                    .map_err(|e| format!("Failed to create {}: {}", remote_path, e))?;
                remote_file
                    .write_all(&content)
                    .await
                    .map_err(|e| format!("Failed to write {}: {}", remote_path, e))?;
                count += 1;
            }
        }

        Ok(count)
    })
}
