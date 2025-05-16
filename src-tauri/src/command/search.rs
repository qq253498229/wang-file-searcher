use crate::utils::file_utils::{find_string_in_file, merge_path, read_dir_files};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct SearchOptions {
    pub text: Option<String>,
    pub options: Options,
}
impl SearchOptions {
    pub fn add_includes(&mut self, path: String) {
        self.options.includes.push(SearchPath {
            label: String::from(""),
            path,
        });
    }
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Options {
    pub includes: Vec<SearchPath>,
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct SearchPath {
    pub label: String,
    pub path: String,
}
#[tauri::command]
pub fn search(options: SearchOptions) -> Result<Vec<PathBuf>, String> {
    println!("options:{options:?}");
    let result = search_files(&options).map_err(|e| {
        eprintln!("{e:?}");
        e.to_string()
    });
    result
}

/// 根据选项搜索全部文件
fn search_files(options: &SearchOptions) -> anyhow::Result<Vec<PathBuf>> {
    let search_text = options.text.as_ref().unwrap();
    let all_file_path = find_all_path(&options)?;
    println!("all_file_path:{all_file_path:?}");
    let mut r = vec![];
    for path in all_file_path.into_iter() {
        let files = read_dir_files(path)?;
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
    for include in options.options.includes.iter() {
        let path = PathBuf::from(&include.path);
        merge_path(&mut path_list, path)?;
    }
    Ok(path_list)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search() -> anyhow::Result<()> {
        let mut options = SearchOptions::default();
        options.text = Some("test".to_string());
        options.add_includes("tests/txt".to_string());
        options.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = search_files(&options)?;
        assert_eq!(5, result.len());
        Ok(())
    }
    #[test]
    fn test_search1() -> anyhow::Result<()> {
        let mut options = SearchOptions::default();
        options.text = Some("test2".to_string());
        options.add_includes("tests/txt".to_string());
        options.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = search_files(&options)?;
        assert_eq!(1, result.len());
        Ok(())
    }

    #[test]
    fn test_resolve_relate_path() -> anyhow::Result<()> {
        let mut options = SearchOptions::default();
        options.text = Some("test2".to_string());
        options.add_includes("tests/txt".to_string());
        options.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = search_files(&options)?;
        assert_eq!(1, result.len());
        Ok(())
    }
}
