use crate::command::entity::{OptionFlag, OptionType, Param};
use std::path::PathBuf;

/// 检查是否匹配参数
pub fn check_refine(param: &Param, path: &PathBuf) -> bool {
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

#[cfg(test)]
mod tests {
    use std::path::PathBuf;
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
}
