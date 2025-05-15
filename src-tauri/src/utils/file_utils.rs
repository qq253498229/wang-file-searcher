use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};

/// 查找文件内容是否包含指定字符串
/// 使用字符级匹配算法，逐个字符读取文件内容
pub fn find_string_in_file<P: AsRef<Path>>(path: P, target: &str) -> std::io::Result<bool> {
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
pub fn read_dir_files(path: &PathBuf) -> anyhow::Result<Vec<PathBuf>> {
    let mut files = vec![];
    if path.is_dir() {
        for entry in fs::read_dir(&path)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                files.append(&mut read_dir_files(&path)?);
            } else if path.is_file() {
                files.push(path);
            }
        }
    } else if path.is_file() {
        files.push(path.to_path_buf());
    }
    Ok(files)
}
/// 合并路径，忽略子目录，只保留最上层的父目录
pub fn merge_path(list: &mut Vec<PathBuf>, new_path: PathBuf) -> anyhow::Result<()> {
    let mut has_child = false;
    // 检查路径关系
    for old_path in list.iter() {
        if old_path == &new_path || new_path.starts_with(old_path) {
            break;
        }
        if old_path.starts_with(&new_path) {
            has_child = true;
            break;
        }
    }
    if has_child {
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
        assert_eq!("tests/txt", list[0].to_str().unwrap());
        Ok(())
    }
}
