use crate::utils::file_utils::merge_path;
use serde::{Deserialize, Serialize};
use std::fs;
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
pub fn search(options: SearchOptions) -> Result<String, ()> {
    println!("search options: {:?}", options);
    Ok("search".to_string())
}

/// 根据选项搜索全部文件
fn search_files(options: SearchOptions) -> anyhow::Result<()> {
    println!("search_files options: {:?}", options);
    // fs::read("tests/txt/")
    let search_text = options.text.as_ref().unwrap();
    let all_file_path = find_all_path(&options)?;
    for path in all_file_path.iter() {
        let content = fs::read(path)?;
    }
    // fs::metadata()
    Ok(())
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
        search_files(options)?;
        Ok(())
    }
}
