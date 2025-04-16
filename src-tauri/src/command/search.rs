use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use crate::utils::file_utils::is_binary_file;

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
        let is_binary = is_binary_file(path)?;
        println!("1");
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
/// 合并路径，忽略子目录，只保留最上层的父目录
fn merge_path(list: &mut Vec<PathBuf>, new_path: PathBuf) -> anyhow::Result<()> {
    let mut has_child = false;
    // 检查路径关系
    for old_path in list.iter() {
        if old_path == &new_path || new_path.starts_with(old_path) {
            break;
        }
        if old_path.starts_with(&new_path) {
            has_child = true;
            break;
        }
    }
    if has_child {
        // 删除所有子路径并添加新父路径
        list.retain(|old_path| !old_path.starts_with(&new_path));
        list.push(new_path);
    } else {
        list.push(new_path);
    }
    Ok(())
}

fn read_dir_files(path: &Path) -> anyhow::Result<Vec<PathBuf>> {
    let mut files = vec![];
    let path = Path::new(path);
    if path.is_dir() {
        for entry in fs::read_dir(&path)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                files.append(&mut read_dir_files(&path)?);
            } else if path.is_file() {
                files.push(path);
            }
        }
    } else if path.is_file() {
        files.push(path.to_path_buf());
    }
    Ok(files)
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
        println!("path={:#?}", &path_list);
        options.path = Some(path_list);
        let result = search_files(options);
        Ok(())
    }
}
