mod excludes;
mod find_string;
pub mod handler;
mod includes;
mod refines;
mod result;
mod validator;

use crate::command::entity::{OptionType, Param};
use crate::search::excludes::check_exclude;
use crate::search::find_string::check_string;
use crate::search::handler::SearchHandler;
use crate::search::includes::check_include;
use crate::search::refines::{check_refine, match_folder};
use crate::search::result::send_file_emit;
use crate::search::validator::is_invalid;
use crate::utils::file_utils::merge_path;
use std::path::PathBuf;
use walkdir::WalkDir;

/// 根据选项搜索全部文件
pub fn search_files(param: &Param, handle: &mut SearchHandler) -> anyhow::Result<()> {
    if is_invalid(param) {
        handle.done()?;
        return Ok(());
    }
    let search_text = &param.text;
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
    handle: &mut SearchHandler,
) -> anyhow::Result<()> {
    let walker = WalkDir::new(&path)
        .min_depth(1)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok());
    for entry in walker {
        if handle.check_stop() {
            return Ok(());
        }
        let path = entry.into_path();
        if !check_include(param, &path) || check_exclude(param, &path) {
            continue;
        }
        handle.send_status(&path)?;
        // 如果搜索的是文件夹
        if match_folder(param, &path) && check_refine(param, &path) {
            send_file_emit(path.clone(), handle)?;
        }
        if path.is_dir() {
            // 这里会遍历子目录
            search_and_send_event(param, path, search_text, handle)?;
            continue;
        }
        if !path.is_file() {
            continue;
        }
        if !check_refine(param, &path) {
            continue;
        }
        if check_string(&path, search_text) {
            send_file_emit(path, handle)?;
        }
    }
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
    use crate::search::handler::SearchHandler;
    use crate::utils::init_logger;
    #[test]
    fn test_search() -> anyhow::Result<()> {
        let mut param = Param::default();
        param.text = "test".to_string();
        param.add_includes("tests/txt".to_string());
        param.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&param)?;
        assert_eq!(5, result.len());
        Ok(())
    }
    #[test]
    fn test_search1() -> anyhow::Result<()> {
        let mut param = Param::default();
        param.text = "test2".to_string();
        param.add_includes("tests/txt".to_string());
        param.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&param)?;
        assert_eq!(1, result.len());
        Ok(())
    }
    #[test]
    #[ignore]
    fn test_search2() -> anyhow::Result<()> {
        init_logger();
        let mut handler = SearchHandler::new(None);
        let mut param = Param::default();
        param.text = "test".to_string();
        param.add_includes("~".to_string());
        search_files(&param, &mut handler)?;
        Ok(())
    }

    #[test]
    fn test_resolve_relate_path() -> anyhow::Result<()> {
        let mut param = Param::default();
        param.text = "test2".to_string();
        param.add_includes("tests/txt".to_string());
        param.add_includes("tests/txt/sub-folder-1-1".to_string());
        let result = find_all_path(&param)?;
        assert_eq!(1, result.len());
        Ok(())
    }
}
