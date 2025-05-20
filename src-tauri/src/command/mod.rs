pub mod entity;
pub mod open_folder;
pub mod search;

use tauri::{Builder, Wry};

pub fn register_all_commands(builder: Builder<Wry>) -> Builder<Wry> {
    builder.invoke_handler(tauri::generate_handler![
        search::search,
        search::stop_search,
        open_folder::open_folder,
    ])
}
