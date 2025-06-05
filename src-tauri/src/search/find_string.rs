use crate::utils::file_utils::find_string_in_file;
use std::path::PathBuf;

pub fn check_string(path: &PathBuf, search_text: &str) -> bool {
    if search_text.trim().len() == 0 {
        return true;
    }
    if let Ok(r) = find_string_in_file(&path, search_text) {
        if r {
            return true;
        }
    }
    false
}
pub fn input_text_empty(search_text: &str) -> bool {
    search_text.is_empty() || search_text.trim().is_empty()
}
