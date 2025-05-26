use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn init_config(app: AppHandle) -> Result<(), String> {
    let _ = init_config_files(&app);
    Ok(())
}

fn init_config_files(app: &AppHandle) -> anyhow::Result<()> {
    let app_local_data_dir = app.path().app_local_data_dir()?;
    let config_file_path = app_local_data_dir.join("config.json");
    println!("config_file_path:{config_file_path:?}");
    Ok(())
}

#[cfg(test)]
mod tests {
    use tauri::test::mock_app;
    use tauri::Manager;
    #[test]
    fn test1() {
        let app = mock_app();
        let result = app.path().app_local_data_dir();
    }
}
