use crate::command::entity::{OptionType, Param};
use std::path::PathBuf;

pub fn is_exclude(param: &Param, path: &PathBuf) -> bool {
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
