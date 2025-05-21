use crate::command::entity::{OptionType, Param, SearchHandler, SearchResult};
use crate::utils::file_utils::{find_string_in_file, merge_path};
use crate::AppState;
use std::path::PathBuf;
use std::sync::Mutex;
use std::{fs, thread};
use tauri::{AppHandle, Manager};
use walkdir::WalkDir;

#[tauri::command]
pub fn search(param: Param, app: AppHandle) -> Result<(), String> {
    let app_handle = app.clone();
    let state = app_handle.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();
    state.is_stop = false;
    thread::spawn(move || {
        let handler = SearchHandler::new(Some(app));
        let _ = search_files(&param, &handler);
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
fn search_files(param: &Param, handle: &SearchHandler) -> anyhow::Result<()> {
    let search_text = param.text.as_ref().unwrap();
    let all_file_path = find_all_path(&param)?;
    for path in all_file_path {
        let _ = search_and_send_event(param, path, search_text, handle);
    }
    handle.done()?;
    Ok(())
}
/// 搜索文件，如果搜到了则向前端发送事件
fn search_and_send_event(
    param: &Param,
    path: PathBuf,
    search_text: &str,
    handle: &SearchHandler,
) -> anyhow::Result<()> {
    let walker = WalkDir::new(&path).into_iter().filter_map(|e| e.ok());
    // 这里walk_dir库会递归遍历全部子文件，所以千万不要自己再重复递归了
    for entry in walker {
        if handle.check_stop() {
            return Ok(());
        }
        let path = entry.into_path();
        if is_exclude(param, &path) || !is_include(param, &path) {
            continue;
        }
        handle.send_status(&path)?;
        if check_string(&path, search_text) {
            send_file_emit(path, handle)?;
        }
    }
    Ok(())
}
fn check_string(path: &PathBuf, search_text: &str) -> bool {
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
fn is_include(param: &Param, path: &PathBuf) -> bool {
    for include in &param.includes {
        match include.typee {
            OptionType::PartPath => {
                if !path
                    .to_string_lossy()
                    .to_lowercase()
                    .contains(&include.input.to_lowercase())
                {
                    return false;
                }
            }
            _ => {}
        }
    }
    true
}
fn is_exclude(param: &Param, path: &PathBuf) -> bool {
    for exclude in &param.excludes {
        match exclude.typee {
            OptionType::FullPath => {
                if path.starts_with(&exclude.input) {
                    return true;
                }
            }
            OptionType::PartPath => {
                if path
                    .to_string_lossy()
                    .to_lowercase()
                    .contains(&exclude.input.to_lowercase())
                {
                    return true;
                }
            }
        }
    }
    false
}
fn send_file_emit(path: PathBuf, handle: &SearchHandler) -> anyhow::Result<()> {
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
    handle.send_result(r)?;
    Ok(())
}
/// 获取所有的搜索路径
fn find_all_path(param: &Param) -> anyhow::Result<Vec<PathBuf>> {
    let mut path_list = vec![];
    for include in param.includes.iter() {
        if let OptionType::PartPath = include.typee {
            continue;
        }
        let path = PathBuf::from(&include.input);
        merge_path(&mut path_list, path)?;
    }
    Ok(path_list)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::entity::{Param, SearchHandler};
    use crate::utils::init_logger;
    use resolve_path::PathResolveExt;
    use std::path::Path;
    use tracing::info;

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
    #[test]
    fn test_search2() -> anyhow::Result<()> {
        init_logger();
        let handler = SearchHandler::new(None);
        let mut param = Param::default();
        param.text = Some("test".to_string());
        param.add_includes("~".to_string());
        search_files(&param, &handler)?;
        Ok(())
    }
    #[test]
    fn test_walker() -> anyhow::Result<()> {
        init_logger();
        let walker = WalkDir::new(
            "/Users/wangbin/src/own/wang-file-searcher/wang-file-searcher/src-tauri/tests"
                .resolve(),
        )
        .into_iter();
        for entry in walker.filter_map(|e| e.ok()) {
            let new_path = entry.into_path();
            info!("new_path: {:?}", new_path);
        }
        Ok(())
    }
}
