use crate::command::entity::{OptionType, Param, SearchResult};
use crate::utils::file_utils::{find_string_in_file, merge_path};
use crate::AppState;
use serde_json::json;
use std::path::PathBuf;
use std::sync::Mutex;
use std::{fs, thread};
use tauri::{AppHandle, Emitter, Manager};
use walkdir::WalkDir;

#[tauri::command]
pub fn search(param: Param, app: AppHandle) -> Result<(), String> {
    println!("search param:{param:#?}");
    let app_handle = app.clone();
    let state = app_handle.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();
    state.is_stop = false;
    thread::spawn(move || {
        let _ = search_files(&param, &app);
    });
    Ok(())
}
#[tauri::command]
pub fn stop_search(app: AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();
    state.is_stop = true;
    Ok(())
}

/// 根据选项搜索全部文件
fn search_files(param: &Param, app: &AppHandle) -> anyhow::Result<()> {
    let search_text = param.text.as_ref().unwrap();
    let all_file_path = find_all_path(&param)?;
    for path in all_file_path {
        if check_search_status_is_stop(&app) {
            break;
        }
        let _ = search_and_send_event(param, path, search_text, app);
    }
    app.emit("search_result", json!({"is_done":true}))?;
    Ok(())
}
/// 检查搜索状态，如果已经停止了则返回true
fn check_search_status_is_stop(app: &AppHandle) -> bool {
    let state = app.state::<Mutex<AppState>>();
    let state = state.lock().unwrap();
    state.is_stop
}
/// 搜索文件，如果搜到了则向前端发送事件
fn search_and_send_event(
    param: &Param,
    path: PathBuf,
    search_text: &str,
    app: &AppHandle,
) -> anyhow::Result<()> {
    if check_search_status_is_stop(&app) {
        return Ok(());
    }
    // info!("search_and_send_event:{path:?}");
    for exclude in &param.excludes {
        match exclude.typee {
            OptionType::FullPath => {
                if path.starts_with(&exclude.input) {
                    return Ok(());
                }
            }
            OptionType::PartPath => {
                if path.to_string_lossy().contains(&exclude.input) {
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
            let _ = search_and_send_event(param, new_path, search_text, &app);
        }
        return Ok(());
    }
    if let Ok(r) = find_string_in_file(&path, search_text) {
        if r {
            let metadata = fs::metadata(&path);
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
            app.emit("search_result", r)?;
        }
    }
    Ok(())
}
/// 获取所有的搜索路径
fn find_all_path(param: &Param) -> anyhow::Result<Vec<PathBuf>> {
    let mut path_list = vec![];
    for include in param.includes.iter() {
        let path = PathBuf::from(&include.input);
        merge_path(&mut path_list, path)?;
    }
    Ok(path_list)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::entity::Param;
    use std::path::Path;

    #[test]
    fn test_search() -> anyhow::Result<()> {
        let mut param = Param::default();
        param.text = Some("test".to_string());
        param.add_includes("tests/txt".to_string());
        param.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&param)?;
        assert_eq!(5, result.len());
        Ok(())
    }
    #[test]
    fn test_search1() -> anyhow::Result<()> {
        let mut param = Param::default();
        param.text = Some("test2".to_string());
        param.add_includes("tests/txt".to_string());
        param.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&param)?;
        assert_eq!(1, result.len());
        Ok(())
    }

    #[test]
    fn test_resolve_relate_path() -> anyhow::Result<()> {
        let mut param = Param::default();
        param.text = Some("test2".to_string());
        param.add_includes("tests/txt".to_string());
        param.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&param)?;
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
