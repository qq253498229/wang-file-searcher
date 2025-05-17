use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// 命令参数
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Param {
    pub text: Option<String>,
    pub includes: Vec<SearchOption>,
    pub excludes: Vec<SearchOption>,
}
impl Param {
    pub fn add_includes(&mut self, path: String) {
        let search_path = SearchOption::from(&path);
        self.includes.push(search_path);
    }
}
/// 搜索选项
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct SearchOption {
    pub input: String,
    #[serde(rename = "type")]
    pub typee: OptionType,
}
impl SearchOption {
    pub fn from(name: &str) -> Self {
        let mut r = Self::default();
        r.input = String::from(name);
        r
    }
}
/// 选项类型
#[derive(Deserialize, Serialize, Debug, Default)]
pub enum OptionType {
    /// 完整路径，可以是绝对路径也可以是相对路径
    #[default]
    FullPath,
    /// 部分路径，路径中包含的片段
    PartPath,
}
/// 搜索结果
#[derive(Deserialize, Serialize, Debug, Default, Clone)]
pub struct SearchResult {
    pub path: PathBuf,
    pub size: u64,
    pub create_at: u128,
    pub update_at: u128,
}
