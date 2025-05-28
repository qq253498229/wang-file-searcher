use crate::command::entity::Param;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::{AppHandle, Manager, Runtime};
use walkdir::WalkDir;

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Config {
    pub id: String,
    pub name: Option<String>,
    pub details: Option<String>,
    pub param: Param,
    pub update_at: Option<u128>,
}
pub fn init_config_files<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<Vec<Config>> {
    let app_local_data_dir = app.path().app_local_data_dir()?;
    let mut r = vec![];
    for entry in WalkDir::new(&app_local_data_dir).min_depth(1).max_depth(1) {
        let entry = entry?;
        let path = entry.path();
        if let Some(ext) = path.extension() {
            let ext = ext.to_str().unwrap();
            if ext == "json" {
                let content = fs::read_to_string(&path)?;
                if let Ok(mut config) = serde_json::from_str::<Config>(&content) {
                    if let Ok(modified) = get_modified_time(path) {
                        config.update_at = Some(modified);
                    }
                    r.push(config);
                }
            }
        }
    }
    r.sort_by_key(|r| r.update_at);
    Ok(r)
}
fn get_modified_time(path: &Path) -> anyhow::Result<u128> {
    let metadata = fs::metadata(path)?;
    let modified = metadata.modified()?;
    let duration = modified.duration_since(std::time::SystemTime::UNIX_EPOCH)?;
    let timestamp = duration.as_millis();
    Ok(timestamp)
}
pub fn save_config_to_local<R: Runtime>(config: Config, app: &AppHandle<R>) -> anyhow::Result<()> {
    let json = serde_json::to_string_pretty(&config)?;
    let uuid = config.id;
    let app_local_data_dir = app.path().app_local_data_dir()?;
    fs::create_dir_all(&app_local_data_dir)?;
    let filename = format!("{}.json", uuid);
    let path = app_local_data_dir.join(filename);
    fs::write(path, json)?;
    Ok(())
}
pub fn delete_config_file<R: Runtime>(config: Config, app: &AppHandle<R>) -> anyhow::Result<()> {
    let id = config.id;
    let filename = format!("{}.json", id);
    let app_local_data_dir = app.path().app_local_data_dir()?;
    let config_file_path = app_local_data_dir.join(filename);
    if fs::exists(&config_file_path)? {
        fs::remove_file(config_file_path)?;
    }
    Ok(())
}
pub fn get_config_folder(app: &AppHandle) -> anyhow::Result<()> {
    let app_local_data_dir = app.path().app_local_data_dir()?;
    tauri_plugin_opener::reveal_item_in_dir(app_local_data_dir)?;
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    use tauri::test::mock_app;
    use tauri::Manager;

    #[test]
    #[ignore]
    fn test_save_config_to_local() -> anyhow::Result<()> {
        let app = mock_app();
        let app = app.app_handle();
        let config = Config::default();
        save_config_to_local(config, app)?;
        Ok(())
    }
    #[test]
    #[ignore]
    fn test_init_config_files() -> anyhow::Result<()> {
        let app = mock_app();
        let app = app.app_handle();
        init_config_files(&app)?;
        Ok(())
    }
    #[test]
    #[ignore]
    fn test_get_metadata() -> anyhow::Result<()> {
        let metadata = fs::metadata("tests/txt/test1.txt")?;
        println!("metadata:{metadata:?}");
        let modified = metadata.modified()?;
        println!("modified:{modified:?}");
        let duration = modified.duration_since(std::time::SystemTime::UNIX_EPOCH)?;
        let timestamp = duration.as_millis();
        println!("timestamp:{timestamp}");
        Ok(())
    }
    #[test]
    #[ignore]
    fn test_delete_config_file() -> anyhow::Result<()> {
        let app = mock_app();
        let app = app.app_handle();
        let path = app.path().app_local_data_dir()?;
        let path = path.join("1397baa75305.json");
        println!("path:{path:?}");
        let result = fs::exists(path)?;
        assert!(result);
        Ok(())
    }
}
