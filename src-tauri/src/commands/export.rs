use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExportSettings {
    output_type: String,
    output_path: Option<String>,
    minify: bool,
    include_project_file: bool,
}

/// Main export command: receives the full project JSON and an output directory path.
/// The actual HTML/CSS/JS generation is done in TypeScript (engine/export/).
/// This command handles file system writes after receiving the pre-generated content.
#[tauri::command]
pub fn write_export_files(files: Vec<ExportFile>, output_path: String) -> Result<(), String> {
    let base = PathBuf::from(&output_path);
    fs::create_dir_all(&base).map_err(|e| e.to_string())?;

    for file in files {
        let target = base.join(&file.relative_path);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::write(&target, &file.content).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportFile {
    pub relative_path: String,
    pub content: String,
}

/// Copy a project asset file to the export directory.
#[tauri::command]
pub fn copy_asset(src_path: String, dest_relative: String, output_path: String) -> Result<(), String> {
    let dest = PathBuf::from(&output_path).join(&dest_relative);
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    // Only allow copies within the output path (prevent path traversal)
    let canonical_output = PathBuf::from(&output_path).canonicalize().map_err(|e| e.to_string())?;
    if let Ok(canonical_dest) = dest.parent().and_then(|p| p.canonicalize().ok()).map(Ok::<_, String>).transpose() {
        if let Some(cd) = canonical_dest {
            if !cd.starts_with(&canonical_output) {
                return Err("Security: destination outside output directory".to_string());
            }
        }
    }
    fs::copy(&src_path, &dest).map_err(|e| e.to_string())?;
    Ok(())
}
