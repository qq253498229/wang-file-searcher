use crate::AppState;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};
use tracing::info;

/// 命令参数
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Param {
    pub text: Option<String>,
    pub includes: Vec<SearchOption>,
    pub excludes: Vec<SearchOption>,
    pub refines: Vec<SearchOption>,
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
    pub flag: OptionFlag,
}
impl SearchOption {
    pub fn from(name: &str) -> Self {
        let mut r = Self::default();
        r.input = String::from(name);
        r
    }
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
/// 为tauri的API提供的struct，主要为了方便测试
pub struct SearchHandler {
    app: Option<AppHandle>,
}
impl SearchHandler {
    pub fn new(app: Option<AppHandle>) -> Self {
        Self { app }
    }

    pub fn check_stop(&self) -> bool {
        if self.app.is_none() {
            return false;
        }
        let app = self.app.as_ref().unwrap();
        let state = app.state::<Mutex<AppState>>();
        let state = state.lock().unwrap();
        state.is_stop
    }
    pub fn done(&self) -> anyhow::Result<()> {
        if self.app.is_none() {
            info!("is_done");
            return Ok(());
        }
        self.app
            .as_ref()
            .unwrap()
            .emit("status", json!({"is_done":true}))?;
        Ok(())
    }
    pub fn send_result(&self, path: SearchResult) -> anyhow::Result<()> {
        if self.app.is_none() {
            info!("result:{path:?}");
            return Ok(());
        }
        self.app.as_ref().unwrap().emit("result", path)?;
        Ok(())
    }
    pub fn send_status(&self, path: &PathBuf) -> anyhow::Result<()> {
        if self.app.is_none() {
            // info!("status:{path:?}");
            return Ok(());
        }
        self.app
            .as_ref()
            .unwrap()
            .emit("status", json!({"path":path}))?;
        Ok(())
    }
}
