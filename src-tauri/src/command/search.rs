use crate::utils::file_utils::{find_string_in_file, merge_path, read_dir_files};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Deserialize, Serialize, Debug)]
pub struct SearchOptions {
    pub text: Option<String>,
    pub path: Option<Vec<String>>,
}
impl SearchOptions {
    pub fn new() -> Self {
        Self {
            text: None,
            path: None,
        }
    }
}
#[tauri::command]
pub fn search(options: SearchOptions) -> Result<Vec<PathBuf>, String> {
    let result = search_files(&options).map_err(|e| e.to_string());
    result
}

/// 根据选项搜索全部文件
fn search_files(options: &SearchOptions) -> anyhow::Result<Vec<PathBuf>> {
    let search_text = options.text.as_ref().unwrap();
    let all_file_path = find_all_path(&options)?;
    let mut r = vec![];
    for path in all_file_path.into_iter() {
        let files = read_dir_files(&path)?;
        for p in files.into_iter() {
            if find_string_in_file(&p, search_text)? {
                r.push(p);
            }
        }
    }
    Ok(r)
}
/// 获取所有的搜索路径
fn find_all_path(options: &SearchOptions) -> anyhow::Result<Vec<PathBuf>> {
    let mut path_list = vec![];
    if options.path.is_some() {
        let paths = options.path.as_ref().unwrap();
        for p in paths {
            let p = PathBuf::from(&p);
            merge_path(&mut path_list, p)?;
        }
    }
    Ok(path_list)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    #[test]
    fn test_search() -> anyhow::Result<()> {
        let mut options = SearchOptions::new();
        options.text = Some("test".to_string());
        let mut path_list = vec![];
        let path = fs::canonicalize("tests/txt")?;
        let path = path.to_str().unwrap().to_string();
        path_list.push(path);
        let path = fs::canonicalize("tests/txt/sub-folder-1-1")?;
        let path = path.to_str().unwrap().to_string();
        path_list.push(path);
        options.path = Some(path_list);
        let result = search_files(&options)?;
        assert_eq!(5, result.len());
        Ok(())
    }
    #[test]
    fn test_search1() -> anyhow::Result<()> {
        let mut options = SearchOptions::new();
        options.text = Some("test2".to_string());
        let mut path_list = vec![];
        let path = fs::canonicalize("tests/txt")?;
        let path = path.to_str().unwrap().to_string();
        path_list.push(path);
        let path = fs::canonicalize("tests/txt/sub-folder-1-1")?;
        let path = path.to_str().unwrap().to_string();
        path_list.push(path);
        options.path = Some(path_list);
        let result = search_files(&options)?;
        assert_eq!(1, result.len());
        Ok(())
    }
}
