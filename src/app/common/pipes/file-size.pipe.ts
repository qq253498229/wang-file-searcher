import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: false,
})
export class FileSizePipe implements PipeTransform {

  transform(value: any, ..._args: unknown[]): unknown {
    const numValue = parseInt(value as string);
    if (isNaN(numValue)) {
      return value;
    }
    // 定义单位数组
    const units = ['B', 'KB', 'MB', 'GB'];

    // 计算数值对应的单位
    let index = 0;
    let currentValue = numValue;

    while (currentValue >= 1024 && index < units.length - 1) {
      currentValue /= 1024;
      index++;
    }

    // 如果单位不是 B，则保留两位小数
    const formattedValue = index === 0
      ? currentValue
      : parseFloat(currentValue.toFixed(0));

    return `${formattedValue}${units[index]}`;
  }

}
