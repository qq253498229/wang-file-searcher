use std::path::Path;
use tauri::AppHandle;

#[tauri::command]
pub fn open_folder(path: String, _: AppHandle) -> Result<(), String> {
    let file_path = Path::new(&path);
    let _ = tauri_plugin_opener::reveal_item_in_dir(file_path);
    Ok(())
}
