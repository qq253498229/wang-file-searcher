use crate::command::entity::{OptionFlag, OptionType, Param};
use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::PathBuf;

/// 检查是否匹配参数
pub fn check_refine(param: &Param, path: &PathBuf) -> anyhow::Result<bool> {
    if !check_filename(param, path) {
        return Ok(false);
    }
    if !check_file_type(param, path) {
        return Ok(false);
    }
    if !check_file_size(param, path)? {
        return Ok(false);
    }
    Ok(true)
}
fn check_file_size(param: &Param, path: &PathBuf) -> anyhow::Result<bool> {
    for refine in &param.refines {
        if let OptionFlag::FileSize = refine.flag {
            let mut input_size = if let Ok(input_size) = refine.input.parse::<u64>() {
                input_size
            } else {
                continue;
            };
            let real_size = fs::metadata(path)?.size();
            if let Some(flag1) = refine.flag1.as_ref() {
                if flag1 == "KB" {
                    input_size *= 1024;
                } else if flag1 == "MB" {
                    input_size *= 1024 * 1024;
                } else if flag1 == "GB" {
                    input_size *= 1024 * 1024 * 1024;
                }
            }
            match refine.typee {
                OptionType::GreaterThan => {
                    if input_size >= real_size {
                        return Ok(false);
                    }
                }
                OptionType::LessThan => {
                    if input_size <= real_size {
                        return Ok(false);
                    }
                }
                _ => {}
            }
        }
    }
    Ok(true)
}
fn check_file_type(param: &Param, path: &PathBuf) -> bool {
    for refine in &param.refines {
        if let OptionFlag::FileType = refine.flag {
            match refine.typee {
                OptionType::Is => {
                    let refine_name = refine.input.to_lowercase();
                    if refine_name.trim().len() == 0 {
                        continue;
                    }
                    let extension = path.extension().unwrap().to_str().unwrap().to_lowercase();
                    if extension != refine_name {
                        return false;
                    }
                }
                OptionType::Not => {
                    let refine_name = refine.input.to_lowercase();
                    if refine_name.trim().len() == 0 {
                        continue;
                    }
                    let extension = path.extension().unwrap().to_str().unwrap().to_lowercase();
                    if extension == refine_name {
                        return false;
                    }
                }
                OptionType::IsFolder => {
                    if !path.is_dir() {
                        return false;
                    }
                }
                OptionType::NotFolder => {
                    if path.is_dir() {
                        return false;
                    }
                }
                _ => {}
            }
            continue;
        }
    }
    true
}
fn check_filename(param: &Param, path: &PathBuf) -> bool {
    for refine in &param.refines {
        if let OptionFlag::Filename = refine.flag {
            let refine_name = refine.input.to_lowercase();
            if refine_name.trim().len() == 0 {
                continue;
            }
            let file_name = path.file_name().unwrap().to_str().unwrap().to_lowercase();
            match refine.typee {
                OptionType::Is => {
                    if file_name != refine_name {
                        return false;
                    }
                }
                OptionType::Not => {
                    if file_name == refine_name {
                        return false;
                    }
                }
                OptionType::Contains => {
                    if !file_name.contains(&refine_name) {
                        return false;
                    }
                }
                OptionType::NotContains => {
                    if file_name.contains(&refine_name) {
                        return false;
                    }
                }
                OptionType::Begin => {
                    if !file_name.starts_with(&refine_name) {
                        return false;
                    }
                }
                OptionType::End => {
                    if !file_name.ends_with(&refine_name) {
                        return false;
                    }
                }
                _ => {}
            }
            continue;
        }
    }
    true
}

pub fn is_refines_valid(param: &Param) -> bool {
    for option in &param.refines {
        if let OptionFlag::Filename = option.flag {
            if option.input.trim().len() > 0 {
                return true;
            }
        }
        if let OptionFlag::FileSize = option.flag {
            if option.input.trim().len() > 0 {
                return true;
            }
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use crate::command::entity::Param;
    use crate::search::handler::SearchHandler;
    use crate::search::search_files;
    use resolve_path::PathResolveExt;
    use std::path::PathBuf;
    use std::sync::{Arc, Mutex};

    #[test]
    fn test1() {
        let filename = PathBuf::from("test.txt");
        let result = filename.file_stem().unwrap().to_str().unwrap().to_string();
        assert_eq!("test", result);
        let result = filename.extension().unwrap().to_str().unwrap().to_string();
        assert_eq!("txt", result);
        let result = filename.file_name().unwrap().to_str().unwrap().to_string();
        assert_eq!("test.txt", result);
    }

    #[test]
    fn test2() -> anyhow::Result<()> {
        let path = PathBuf::from("tests");
        let path = path.resolve().to_str().unwrap().to_string();
        let mut param = Param::default();
        param.add_includes(path);
        param.set_file_type_is_folder();
        param.set_filename_contains("sub");

        let result = Arc::new(Mutex::new(vec![]));
        let result_clone = Arc::clone(&result);
        let mut handler = SearchHandler::test(move |r| {
            let mut result = result_clone.lock().unwrap();
            result.push(r);
            Ok(())
        });
        search_files(&param, &mut handler)?;
        let result = result.lock().unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].file_name, Some("sub-folder-1-1".to_string()));
        Ok(())
    }
    #[test]
    fn test3() -> anyhow::Result<()> {
        let path = PathBuf::from("tests");
        let path = path.resolve().to_str().unwrap().to_string();
        let mut param = Param::default();
        param.add_includes(path);
        param.set_file_type_is_folder();
        param.set_filename_not_contains("sub");

        let result = Arc::new(Mutex::new(vec![]));
        let result_clone = Arc::clone(&result);
        let mut handler = SearchHandler::test(move |r| {
            let mut result = result_clone.lock().unwrap();
            result.push(r);
            Ok(())
        });
        search_files(&param, &mut handler)?;
        let result = result.lock().unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].file_name, Some("txt".to_string()));
        Ok(())
    }
    #[test]
    fn test4() -> anyhow::Result<()> {
        let value: String = "30".to_string();
        let size: u64 = 30;
        let value = value.parse::<u64>()?;
        // let value = u64::from(value);
        assert_eq!(value, size);
        Ok(())
    }
}
