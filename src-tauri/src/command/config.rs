use crate::config::{
    delete_config_file, get_config_folder, init_config_files, save_config_to_local, Config,
};
use tauri::AppHandle;

#[tauri::command]
pub fn init_config(app: AppHandle) -> Result<Vec<Config>, String> {
    init_config_files(&app).map_err(|e| e.to_string())
}
#[tauri::command]
pub fn save_config(config: Config, app: AppHandle) -> Result<(), String> {
    save_config_to_local(config, &app).map_err(|e| e.to_string())
}
#[tauri::command]
pub fn delete_config(config: Config, app: AppHandle) -> Result<(), String> {
    delete_config_file(config, &app).map_err(|e| e.to_string())
}
#[tauri::command]
pub fn open_config_folder(app: AppHandle) -> Result<(), String> {
    get_config_folder(&app).map_err(|e| e.to_string())
}
