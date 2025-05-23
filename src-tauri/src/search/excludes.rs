use crate::command::entity::{OptionType, Param};
use std::path::PathBuf;

/// 检查是否在排除位置中
pub fn check_exclude(param: &Param, path: &PathBuf) -> bool {
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
            _ => {}
        }
    }
    false
}
