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
