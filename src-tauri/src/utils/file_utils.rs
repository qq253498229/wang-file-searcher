use std::fs::File;
use std::io::Read;
use std::path::Path;

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
}
