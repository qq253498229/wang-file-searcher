use crate::command::register_all_commands;
use crate::utils::init_logger;
use std::sync::Mutex;
use tauri::Manager;

pub mod command;
pub mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_logger();
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            app.manage(Mutex::new(AppState::new()));
            #[cfg(debug_assertions)] // 仅在调试构建时包含此代码
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init());
    builder = register_all_commands(builder);
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub struct AppState {
    is_stop: bool,
}
impl AppState {
    pub fn new() -> Self {
        Self { is_stop: true }
    }
}
