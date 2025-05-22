use resolve_path::PathResolveExt;
use tauri2_demo1_lib::utils::init_logger;
use tracing::info;
use walkdir::WalkDir;

#[test]
#[ignore]
fn test_walker() -> anyhow::Result<()> {
    init_logger();
    let walker =
        WalkDir::new("~/src/own/wang-file-searcher/wang-file-searcher/src-tauri/tests".resolve())
            .into_iter();
    for entry in walker.filter_map(|e| e.ok()) {
        let new_path = entry.into_path();
        info!("new_path: {:?}", new_path);
    }
    Ok(())
}

#[test]
#[ignore]
fn test_walker1() -> anyhow::Result<()> {
    init_logger();
    let walker = WalkDir::new("~/src/tauri".resolve())
        .min_depth(1)
        .max_depth(1)
        .into_iter();
    for entry in walker {
        let new_path = entry?.into_path();
        info!("new_path: {:?}", new_path);
    }
    Ok(())
}
