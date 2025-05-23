use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// 命令参数
#[derive(Deserialize, Serialize, Debug)]
pub struct Param {
    pub text: String,
    pub includes: Vec<SearchOption>,
    pub excludes: Vec<SearchOption>,
    pub refines: Vec<SearchOption>,
}
impl Default for Param {
    fn default() -> Self {
        Self {
            text: "".to_string(),
            includes: vec![],
            excludes: vec![],
            refines: vec![],
        }
    }
}
impl Param {
    pub fn add_includes(&mut self, path: String) {
        let search_path = SearchOption::from(&path);
        self.includes.push(search_path);
    }
    pub fn set_file_type_is_folder(&mut self) {
        let mut refine = SearchOption::default();
        refine.flag = OptionFlag::FileType;
        refine.typee = OptionType::Folder;
        self.refines.push(refine);
    }
    pub fn set_filename_contains(&mut self, filename: &str) {
        let mut refine = SearchOption::default();
        refine.flag = OptionFlag::Filename;
        refine.typee = OptionType::Contains;
        refine.input = filename.to_string();
        self.refines.push(refine);
    }
    pub fn set_filename_not_contains(&mut self, filename: &str) {
        let mut refine = SearchOption::default();
        refine.flag = OptionFlag::Filename;
        refine.typee = OptionType::NotContains;
        refine.input = filename.to_string();
        self.refines.push(refine);
    }
}
/// 搜索选项
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct SearchOption {
    pub input: String,
    #[serde(rename = "type")]
    pub typee: OptionType,
    pub flag: OptionFlag,
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub enum OptionFlag {
    /// 用户HOME目录
    #[default]
    Home,
    /// 自定义精确目录
    Custom,
    /// 手动输入
    Input,
    /// 文件名
    Filename,
    /// 文件类型
    FileType,
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub enum OptionType {
    /// 完整路径，可以是绝对路径也可以是相对路径
    #[default]
    FullPath,
    /// 部分路径，路径中包含的片段
    PartPath,
    /// 是
    Is,
    /// 不是
    Not,
    /// 包含
    Contains,
    /// 不包含
    NotContains,
    /// 开头
    Begin,
    /// 结尾
    End,
    /// 文件夹
    Folder,
}
/// 搜索结果
#[derive(Deserialize, Serialize, Debug, Default, Clone)]
pub struct SearchResult {
    pub path: PathBuf,
    pub file_name: Option<String>,
    pub file_stem: Option<String>,
    pub extension: Option<String>,
    pub size: u64,
    pub create_at: u128,
    pub update_at: u128,
}
impl SearchOption {
    pub fn from(name: &str) -> Self {
        let mut r = Self::default();
        r.input = String::from(name);
        r
    }
}
