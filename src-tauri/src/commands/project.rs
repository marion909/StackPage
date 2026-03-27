use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;
use chrono::Utc;

// ─── Shared Project types (mirror of TypeScript) ──────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectMeta {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub tags: Option<Vec<String>>,
    pub thumbnail: Option<String>,
    pub updated_at: String,
    pub file_path: String,
}

// We treat the full project as an opaque JSON value to avoid duplicating
// every TypeScript type in Rust. We validate it lightly.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectJson {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub tags: Option<Vec<String>>,
    pub thumbnail: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    #[serde(flatten)]
    pub rest: serde_json::Value,
}

// ─── Commands ─────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_projects() -> Result<Vec<ProjectMeta>, String> {
    let mut seen: HashSet<String> = HashSet::new();
    let mut projects: Vec<ProjectMeta> = Vec::new();

    // 1. Scan default Documents/StackPage folder
    if let Some(base) = dirs_base() {
        let _ = scan_for_projects(&base, &mut projects, &mut seen, 0);
    }

    // 2. Also load any paths registered outside the default folder
    let registry = load_registry();
    for path_str in registry {
        if seen.contains(&path_str) { continue; }
        let path = PathBuf::from(&path_str);
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(proj) = serde_json::from_str::<ProjectJson>(&content) {
                    seen.insert(path_str.clone());
                    projects.push(ProjectMeta {
                        id: proj.id,
                        name: proj.name,
                        description: proj.description,
                        author: proj.author,
                        tags: proj.tags,
                        thumbnail: proj.thumbnail,
                        updated_at: proj.updated_at,
                        file_path: path_str,
                    });
                }
            }
        }
    }

    projects.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(projects)
}

fn scan_for_projects(dir: &Path, out: &mut Vec<ProjectMeta>, seen: &mut HashSet<String>, depth: u32) -> Result<(), String> {
    if depth > 3 { return Ok(()); }
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            let _ = scan_for_projects(&path, out, seen, depth + 1);
        } else if path.file_name().and_then(|n| n.to_str()) == Some("stackpage.project.json") {
            let path_str = path.to_string_lossy().to_string();
            if seen.contains(&path_str) { continue; }
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(proj) = serde_json::from_str::<ProjectJson>(&content) {
                    seen.insert(path_str.clone());
                    out.push(ProjectMeta {
                        id: proj.id,
                        name: proj.name,
                        description: proj.description,
                        author: proj.author,
                        tags: proj.tags,
                        thumbnail: proj.thumbnail,
                        updated_at: proj.updated_at,
                        file_path: path_str,
                    });
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn load_project(file_path: String) -> Result<serde_json::Value, String> {
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let mut value: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    // Inject file path so frontend knows where to save
    if let Some(obj) = value.as_object_mut() {
        obj.insert("projectFilePath".to_string(), serde_json::Value::String(file_path));
    }
    Ok(value)
}

#[tauri::command]
pub fn save_project(project: serde_json::Value) -> Result<(), String> {
    let file_path = project
        .get("projectFilePath")
        .and_then(|v| v.as_str())
        .ok_or("Project has no file path — cannot save")?
        .to_string();

    let content = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    
    // Ensure directory exists
    if let Some(parent) = Path::new(&file_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Backup previous save before overwriting
    let bak_path = file_path.replace("stackpage.project.json", "stackpage.project.bak");
    if Path::new(&file_path).exists() {
        let _ = fs::copy(&file_path, &bak_path);
    }
    
    fs::write(&file_path, content).map_err(|e| e.to_string())?;

    // Register path so list_projects finds it even if stored outside default folder
    register_project_path(&file_path);

    Ok(())
}

#[tauri::command]
pub fn create_project(
    name: String,
    description: String,
    dir_path: String,
) -> Result<serde_json::Value, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    // Sanitize folder name
    let folder_name: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '-' })
        .collect::<String>()
        .trim_matches('-')
        .to_lowercase();
    
    let project_dir = PathBuf::from(&dir_path).join(&folder_name);
    let file_path = project_dir.join("stackpage.project.json");
    
    // Create directory structure
    fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(project_dir.join("assets")).map_err(|e| e.to_string())?;
    
    // Build minimal project JSON with defaults
    let home_page_id = Uuid::new_v4().to_string();
    let project = serde_json::json!({
        "id": id,
        "name": name,
        "description": if description.is_empty() { None::<String> } else { Some(description) },
        "createdAt": now,
        "updatedAt": now,
        "projectFilePath": file_path.to_string_lossy(),
        "pages": [{
            "id": home_page_id,
            "name": "Home",
            "slug": "index",
            "sections": [],
            "order": 0
        }],
        "assets": [],
        "theme": {
            "primaryColor": "#2563eb",
            "secondaryColor": "#64748b",
            "accentColor": "#f59e0b",
            "backgroundColor": "#ffffff",
            "textColor": "#1e293b",
            "headingFont": "Inter",
            "bodyFont": "Inter",
            "baseFontSize": 16,
            "headingSizes": { "h1": 3.0, "h2": 2.25, "h3": 1.75, "h4": 1.375 },
            "spacing": { "xs": 8, "sm": 16, "md": 32, "lg": 64, "xl": 96 },
            "borderRadius": 8,
            "maxWidth": 1200
        },
        "exportSettings": {
            "outputType": "html",
            "minify": false,
            "includeProjectFile": true
        }
    });
    
    let content = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    fs::write(&file_path, content).map_err(|e| e.to_string())?;
    
    // Register this project's path so list_projects can find it later
    register_project_path(file_path.to_string_lossy().as_ref());

    Ok(project)
}

#[tauri::command]
pub fn delete_project(file_path: String) -> Result<(), String> {
    // Only delete the project file, NOT the whole directory (safety)
    fs::remove_file(&file_path).map_err(|e| e.to_string())?;
    unregister_project_path(&file_path);
    Ok(())
}

#[tauri::command]
pub fn duplicate_project(
    file_path: String,
    new_name: String,
    dest_dir: String,
) -> Result<serde_json::Value, String> {
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let mut project: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    let new_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    if let Some(obj) = project.as_object_mut() {
        obj.insert("id".to_string(), serde_json::Value::String(new_id));
        obj.insert("name".to_string(), serde_json::Value::String(new_name.clone()));
        obj.insert("createdAt".to_string(), serde_json::Value::String(now.clone()));
        obj.insert("updatedAt".to_string(), serde_json::Value::String(now));
    }
    
    let folder_name: String = new_name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '-' })
        .collect::<String>()
        .trim_matches('-')
        .to_lowercase();
    
    let new_dir = PathBuf::from(&dest_dir).join(&folder_name);
    let new_file = new_dir.join("stackpage.project.json");
    
    fs::create_dir_all(&new_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(new_dir.join("assets")).map_err(|e| e.to_string())?;
    
    if let Some(obj) = project.as_object_mut() {
        obj.insert("projectFilePath".to_string(), serde_json::Value::String(new_file.to_string_lossy().to_string()));
    }
    
    let out = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    fs::write(&new_file, out).map_err(|e| e.to_string())?;
    
    register_project_path(&new_file.to_string_lossy());

    Ok(project)
}

// ─── Helper: default projects directory ───────────────────────────────────

pub fn dirs_base() -> Option<PathBuf> {
    // Try well-known environment variables across platforms
    if let Some(docs) = std::env::var_os("USERPROFILE")
        .or_else(|| std::env::var_os("HOME"))
    {
        let p = PathBuf::from(docs).join("Documents").join("StackPage");
        let _ = fs::create_dir_all(&p);
        return Some(p);
    }
    None
}

// ─── Project registry ────────────────────────────────────────────────────
// Stores absolute paths of all known project files so projects created in
// arbitrary user-chosen directories still appear in list_projects().

fn registry_path() -> Option<PathBuf> {
    // Use APPDATA on Windows, XDG_CONFIG_HOME / HOME on Linux/macOS
    let config_base = std::env::var_os("APPDATA")
        .or_else(|| std::env::var_os("XDG_CONFIG_HOME"))
        .or_else(|| std::env::var_os("HOME").map(|h| {
            let mut p = PathBuf::from(h);
            p.push(".config");
            p.into_os_string()
        }));
    config_base.map(|base| PathBuf::from(base).join("StackPage").join("registry.json"))
}

fn load_registry() -> Vec<String> {
    let path = match registry_path() { Some(p) => p, None => return Vec::new() };
    if !path.exists() { return Vec::new(); }
    let content = match fs::read_to_string(&path) { Ok(c) => c, Err(_) => return Vec::new() };
    serde_json::from_str::<Vec<String>>(&content).unwrap_or_default()
}

fn save_registry(paths: &[String]) {
    let path = match registry_path() { Some(p) => p, None => return };
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string_pretty(paths) {
        let _ = fs::write(&path, json);
    }
}

fn register_project_path(file_path: &str) {
    let mut reg = load_registry();
    if !reg.iter().any(|p| p == file_path) {
        reg.push(file_path.to_string());
        save_registry(&reg);
    }
}

fn unregister_project_path(file_path: &str) {
    let reg: Vec<String> = load_registry().into_iter().filter(|p| p != file_path).collect();
    save_registry(&reg);
}
