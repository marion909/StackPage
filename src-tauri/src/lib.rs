mod commands;

use commands::project::{
    list_projects, load_project, save_project, create_project, delete_project, duplicate_project,
};
use commands::export::{write_export_files, copy_asset};
use commands::deploy::{test_ftp_connection, deploy_ftp};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            list_projects,
            load_project,
            save_project,
            create_project,
            delete_project,
            duplicate_project,
            write_export_files,
            copy_asset,
            test_ftp_connection,
            deploy_ftp,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
