use crate::command::entity::{SearchHandler, SearchResult};
use std::path::PathBuf;

pub fn send_file_emit(path: PathBuf, handle: &SearchHandler) -> anyhow::Result<()> {
    let metadata = std::fs::metadata(&path);
    let file_name = path
        .as_path()
        .file_name()
        .and_then(|r| r.to_str())
        .map(|r| r.to_string());
    let file_stem = path
        .as_path()
        .file_stem()
        .and_then(|r| r.to_str())
        .map(|r| r.to_string());
    let extension = path
        .as_path()
        .extension()
        .and_then(|r| r.to_str())
        .map(|r| r.to_string());
    let mut r = SearchResult {
        path,
        file_name,
        file_stem,
        extension,
        size: 0,
        create_at: 0,
        update_at: 0,
    };
    if let Ok(metadata) = metadata {
        r.size = metadata.len();
        r.update_at = metadata
            .modified()?
            .duration_since(std::time::SystemTime::UNIX_EPOCH)?
            .as_millis();
        r.create_at = metadata
            .created()?
            .duration_since(std::time::SystemTime::UNIX_EPOCH)?
            .as_millis();
    }
    handle.send_result(r)?;
    Ok(())
}
