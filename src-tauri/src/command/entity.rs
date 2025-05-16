use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct SearchOptions {
    pub text: Option<String>,
    pub options: Options,
}
impl SearchOptions {
    pub fn add_includes(&mut self, path: String) {
        let search_path = SearchPath::from(&path);
        self.options.includes.push(search_path);
    }
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Options {
    pub includes: Vec<SearchPath>,
    pub excludes: Vec<SearchPath>,
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct SearchPath {
    pub path: String,
    pub path_type: PathType,
}
impl SearchPath {
    pub fn from(name: &str) -> Self {
        let mut r = Self::default();
        r.path = String::from(name);
        r
    }
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub enum PathType {
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
