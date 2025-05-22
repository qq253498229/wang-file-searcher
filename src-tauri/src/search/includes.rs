use crate::command::entity::{OptionType, Param};
use std::path::PathBuf;

pub fn is_include(param: &Param, path: &PathBuf) -> bool {
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
