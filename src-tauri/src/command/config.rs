use crate::config::Config;
use std::fs;
use tauri::{AppHandle, Manager, Runtime};
use walkdir::WalkDir;

#[tauri::command]
pub fn init_config(app: AppHandle) -> Result<Vec<Config>, String> {
    init_config_files(&app).map_err(|e| e.to_string())
}

fn init_config_files<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<Vec<Config>> {
    let app_local_data_dir = app.path().app_local_data_dir()?;
    println!("app_local_data_dir:{app_local_data_dir:?}");
    let mut r = vec![];
    for entry in WalkDir::new(&app_local_data_dir).min_depth(1).max_depth(1) {
        let entry = entry?;
        let path = entry.path();
        println!("path:{path:?}");
        if let Some(ext) = path.extension() {
            let ext = ext.to_str().unwrap();
            if ext == "json" {
                let content = fs::read_to_string(&path)?;
                if let Ok(config) = serde_json::from_str::<Config>(&content) {
                    println!("config:{config:#?}");
                    r.push(config);
                }
            }
        }
    }
    Ok(r)
}

#[tauri::command]
pub fn save_config(config: Config, app: AppHandle) -> Result<(), String> {
    save_config_to_local(config, &app).map_err(|e| e.to_string())
}
fn save_config_to_local<R: Runtime>(config: Config, app: &AppHandle<R>) -> anyhow::Result<()> {
    let json = serde_json::to_string_pretty(&config)?;
    let uuid = config.id;
    let app_local_data_dir = app.path().app_local_data_dir()?;
    fs::create_dir_all(&app_local_data_dir)?;
    let filename = format!("{}.json", uuid);
    let path = app_local_data_dir.join(filename);
    fs::write(path, json)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::Config;
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
}
