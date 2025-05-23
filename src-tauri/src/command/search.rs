use crate::command::entity::Param;
use crate::search::handler::SearchHandler;
use crate::search::search_files;
use crate::AppState;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn search(param: Param, app: AppHandle) -> Result<(), String> {
    let app_handle = app.clone();
    let state = app_handle.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();
    state.is_stop = false;
    std::thread::spawn(move || {
        let mut handler = SearchHandler::new(Some(app));
        let _ = search_files(&param, &mut handler);
    });
    Ok(())
}
#[tauri::command]
pub fn stop_search(app: AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();
    state.is_stop = true;
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    #[test]
    fn test_file_path() {
        let path = Path::new("1.txt");
        assert_eq!("1", path.file_stem().unwrap().to_str().unwrap());
        assert_eq!("txt", path.extension().unwrap().to_str().unwrap());
        assert_eq!("1.txt", path.file_name().unwrap().to_str().unwrap());

        let path = Path::new(".npmrc");
        assert_eq!(".npmrc", path.file_stem().unwrap().to_str().unwrap());
        assert_eq!(None, path.extension());
        assert_eq!(".npmrc", path.file_name().unwrap().to_str().unwrap());

        let path = Path::new("Dockerfile");
        assert_eq!("Dockerfile", path.file_stem().unwrap().to_str().unwrap());
        assert_eq!(None, path.extension());
        assert_eq!("Dockerfile", path.file_name().unwrap().to_str().unwrap());
    }
}
