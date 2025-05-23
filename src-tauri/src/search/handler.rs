use crate::command::entity::SearchResult;
use crate::AppState;
use serde_json::json;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};
use tracing::info;

/// 为tauri的API提供的struct，主要为了方便测试
pub struct SearchHandler {
    app: Option<AppHandle>,
    test_handler: Option<Box<dyn FnMut(SearchResult) -> anyhow::Result<()>>>,
}
impl SearchHandler {
    pub fn new(app: Option<AppHandle>) -> Self {
        Self {
            app,
            test_handler: None,
        }
    }
    pub fn test<F>(fun: F) -> Self
    where
        F: FnMut(SearchResult) -> anyhow::Result<()> + 'static,
    {
        Self {
            app: None,
            test_handler: Some(Box::new(fun)),
        }
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
    pub fn send_result(&mut self, path: SearchResult) -> anyhow::Result<()> {
        if self.app.is_none() {
            info!("result:{path:?}");
            if let Some(ref mut fun) = self.test_handler {
                fun(path)?;
            }
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
