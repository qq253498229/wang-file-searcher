export function generateUuid() {
  // 使用随机数生成 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // 随机生成一个 0-15 的整数
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // 对于 'y'，确保生成的值在 8-11 之间
    return v.toString(16); // 转换为十六进制字符串
  });
}

export function generateUid() {
  // 使用随机数生成 UUID
  return 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // 随机生成一个 0-15 的整数
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // 对于 'y'，确保生成的值在 8-11 之间
    return v.toString(16); // 转换为十六进制字符串
  });
}

