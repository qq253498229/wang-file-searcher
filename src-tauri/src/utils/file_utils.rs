use resolve_path::PathResolveExt;
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

/// 判断文件是否是二进制文件
pub fn is_binary_file<P: AsRef<Path>>(path: P) -> std::io::Result<bool> {
    let mut file = File::open(path)?;
    let mut buffer = [0u8; 1024]; // 只读取前 1024 字节
    let bytes_read = file.read(&mut buffer)?;

    // 检查读取的字节中是否包含非打印字符
    for &byte in &buffer[..bytes_read] {
        if byte < 32 && byte != 10 && byte != 13 {
            return Ok(true); // 发现非打印字符，认为是二进制文件
        }
    }
    Ok(false) // 未发现非打印字符，认为不是二进制文件
}
/// 查找文件内容是否包含指定字符串
/// 使用字符级匹配算法，逐个字符读取文件内容
pub fn find_string_in_file<P: AsRef<Path>>(path: P, target: &str) -> std::io::Result<bool> {
    if is_binary_file(&path)? {
        return Ok(false);
    }
    let mut file = File::open(path)?;
    let mut buffer = [0u8; 1]; // 每次读取1个字节
    let target = target.as_bytes();
    let mut matched = 0;
    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break; // 文件结束
        }
        let read_char = buffer[0].to_ascii_lowercase();
        let target_char = target[matched].to_ascii_lowercase();
        if read_char == target_char {
            matched += 1;
            if matched == target.len() {
                return Ok(true); // 完全匹配
            }
        } else {
            matched = 0;
        }
    }
    Ok(false) // 未匹配到
}

/// 读取目录内的全部文件
pub fn read_dir_files(path: PathBuf) -> anyhow::Result<Vec<PathBuf>> {
    let mut files = vec![];
    if path.is_dir() {
        let walker = WalkDir::new(&path).into_iter();
        for entry in walker.filter_map(|e| e.ok()) {
            let new_path = entry.into_path();
            if new_path.is_dir() {
                if new_path == path {
                    continue;
                }
                files.append(&mut read_dir_files(new_path)?);
            } else if new_path.is_file() {
                files.push(new_path);
            }
        }
    } else if path.is_file() {
        files.push(path);
    }
    Ok(files)
}
/// 合并路径，忽略子目录，只保留最上层的父目录
pub fn merge_path(list: &mut Vec<PathBuf>, new_path: PathBuf) -> anyhow::Result<()> {
    let new_path = new_path.resolve();
    let new_path = PathBuf::from(new_path);
    let mut has_parent = false;
    let mut has_child = false;
    // 检查路径关系
    for old_path in list.iter() {
        if old_path == &new_path || new_path.starts_with(old_path) {
            has_parent = true;
            break;
        }
        if old_path.starts_with(&new_path) {
            has_child = true;
            break;
        }
    }
    if has_parent {
    } else if has_child {
        // 删除所有子路径并添加新父路径
        list.retain(|old_path| !old_path.starts_with(&new_path));
        list.push(new_path);
    } else {
        list.push(new_path);
    }
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::utils::init_logger;
    use std::fs;
    use tracing::info;
    use walkdir::WalkDir;

    #[test]
    fn test_find_string_in_file() -> anyhow::Result<()> {
        assert!(!find_string_in_file("tests/txt/test1.txt", "Hell1")?);
        assert!(find_string_in_file("tests/txt/test1.txt", "hello")?);
        assert!(find_string_in_file("tests/txt/test1.txt", "HelLo")?);
        Ok(())
    }
    #[test]
    fn test_merge_path() -> anyhow::Result<()> {
        let mut list = vec![];
        merge_path(&mut list, PathBuf::from("tests/txt/sub-folder-1-1"))?;
        merge_path(&mut list, PathBuf::from("tests/txt"))?;
        assert_eq!(1, list.len());
        Ok(())
    }
    #[test]
    fn test_merge_path1() -> anyhow::Result<()> {
        let mut list = vec![];
        merge_path(&mut list, PathBuf::from("~"))?;
        assert_eq!(1, list.len());
        Ok(())
    }
    #[test]
    #[ignore]
    fn test_read_local_file() -> anyhow::Result<()> {
        let result = fs::read_dir("/Users/wangbin")?;
        println!("{:?}", result);
        let result = fs::read_dir(
            "/Users/wangbin/src/own/wang-file-searcher/wang-file-searcher/src-tauri/src/command",
        )?;
        println!("{:?}", result);
        Ok(())
    }

    #[test]
    #[ignore]
    fn test_readable() -> anyhow::Result<()> {
        let path = "/Users/wangbin/.wine/dosdevices/z:/usr/sbin/authserver";
        let result = fs::read_dir(path);
        println!("{:?}", result);
        let metadata = fs::metadata(path)?;
        println!("metadata:{:?}", metadata);
        // metadata.permissions().readonly();
        Ok(())
    }

    #[test]
    #[ignore]
    fn test_read_dir_files() -> anyhow::Result<()> {
        init_logger();
        // let home_dir = home::home_dir().unwrap();
        // let home_dir = home_dir.to_str().unwrap();
        let mut list = vec![];
        merge_path(&mut list, PathBuf::from("~"))?;
        let path = &list[0];

        // let path = PathBuf::from("D:\\src");
        // let result = read_dir_files(&path)?;

        let dir = fs::read_dir(path)?;
        for entry in dir {
            let entry = entry?;
            let path = entry.path();
            info!("path:{:?}", path);
        }
        Ok(())
    }

    #[test]
    #[ignore]
    fn test_read_dir_files1() -> anyhow::Result<()> {
        init_logger();
        let path = "~".resolve();
        for entry in WalkDir::new(path) {
            let entry = entry?;
            let path = entry.path();
            info!("{:?}", path);
        }
        Ok(())
    }
    #[test]
    #[ignore]
    fn test_read_dir_files2() -> anyhow::Result<()> {
        init_logger();
        let path = "~".resolve();
        let walker = WalkDir::new(&path).into_iter();
        info!("{:?}", walker);
        for entry in walker.filter_map(|e| e.ok()) {
            let path = entry.into_path();
            info!("{:?}", path);
        }
        Ok(())
    }
}
