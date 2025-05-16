use crate::command::entity::{PathType, SearchOptions, SearchResult};
use crate::utils::file_utils::{find_string_in_file, merge_path};
use std::path::PathBuf;
use std::{fs, thread};
use tauri::{AppHandle, Emitter};
use walkdir::WalkDir;

#[tauri::command]
pub fn search(options: SearchOptions, app: AppHandle) -> Result<(), String> {
    thread::spawn(move || {
        let _ = search_files(&options, &app);
    });
    Ok(())
}

/// 根据选项搜索全部文件
fn search_files(options: &SearchOptions, app: &AppHandle) -> anyhow::Result<()> {
    let search_text = options.text.as_ref().unwrap();
    let all_file_path = find_all_path(&options)?;
    for path in all_file_path {
        let _ = search_and_send_event(options, path, search_text, app);
    }
    Ok(())
}
/// 搜索文件，如果搜到了则向前端发送事件
fn search_and_send_event(
    options: &SearchOptions,
    path: PathBuf,
    search_text: &str,
    app: &AppHandle,
) -> anyhow::Result<()> {
    // info!("search_and_send_event:{path:?}");
    for exclude in &options.options.excludes {
        match exclude.path_type {
            PathType::FullPath => {
                if path.starts_with(&exclude.path) {
                    return Ok(());
                }
            }
            PathType::PartPath => {
                if path.to_string_lossy().contains(&exclude.path) {
                    return Ok(());
                }
            }
        }
    }

    if path.is_dir() || !path.is_file() {
        let walker = WalkDir::new(&path).into_iter();
        for entry in walker.filter_map(|e| e.ok()) {
            let new_path = entry.into_path();
            if new_path == path {
                continue;
            }
            let _ = search_and_send_event(options, new_path, search_text, &app);
        }
        return Ok(());
    }
    if let Ok(r) = find_string_in_file(&path, search_text) {
        if r {
            let metadata = fs::metadata(&path);
            let mut r = SearchResult {
                path,
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
            app.emit("search_result", r)?;
        }
    }
    Ok(())
}
/// 获取所有的搜索路径
fn find_all_path(options: &SearchOptions) -> anyhow::Result<Vec<PathBuf>> {
    let mut path_list = vec![];
    for include in options.options.includes.iter() {
        let path = PathBuf::from(&include.path);
        merge_path(&mut path_list, path)?;
    }
    Ok(path_list)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::entity::SearchOptions;
    use std::path::Path;

    #[test]
    fn test_search() -> anyhow::Result<()> {
        let mut options = SearchOptions::default();
        options.text = Some("test".to_string());
        options.add_includes("tests/txt".to_string());
        options.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&options)?;
        assert_eq!(5, result.len());
        Ok(())
    }
    #[test]
    fn test_search1() -> anyhow::Result<()> {
        let mut options = SearchOptions::default();
        options.text = Some("test2".to_string());
        options.add_includes("tests/txt".to_string());
        options.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&options)?;
        assert_eq!(1, result.len());
        Ok(())
    }

    #[test]
    fn test_resolve_relate_path() -> anyhow::Result<()> {
        let mut options = SearchOptions::default();
        options.text = Some("test2".to_string());
        options.add_includes("tests/txt".to_string());
        options.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&options)?;
        assert_eq!(1, result.len());
        Ok(())
    }

    #[test]
    fn test_file_path() {
        let path = Path::new("1.txt");
        assert_eq!("1", path.file_stem().unwrap().to_str().unwrap());
        assert_eq!("txt", path.extension().unwrap().to_str().unwrap());
        assert_eq!("1.txt", path.file_name().unwrap().to_str().unwrap());

        let path = Path::new(".npmrc");
        assert_eq!(".npmrc", path.file_stem().unwrap().to_str().unwrap());
        assert_eq!(None, path.extension());
        assert_eq!(".npmrc", path.file_name().unwrap().to_str().unwrap());

        let path = Path::new("Dockerfile");
        assert_eq!("Dockerfile", path.file_stem().unwrap().to_str().unwrap());
        assert_eq!(None, path.extension());
        assert_eq!("Dockerfile", path.file_name().unwrap().to_str().unwrap());
    }
}
