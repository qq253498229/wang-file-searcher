pub mod search;
pub mod entity;

use tauri::{Builder, Wry};

pub fn register_all_commands(builder: Builder<Wry>) -> Builder<Wry> {
    builder.invoke_handler(tauri::generate_handler![search::search])
}
