export interface SearchOption {
  /**
   * 显示名称
   */
  label: string;
  type: SearchType;
  input: string;
  flag: SearchFlag;
}

export type SearchType = 'FullPath' | 'PartPath'
  | 'Is' | 'Not' | 'Contains' | 'NotContains' | 'Begin' | 'End' | 'Folder';
/**
 * <ul>
 *   <li>Home：用户HOME目录</li>
 *   <li>Custom：自定义目录</li>
 *   <li>Input：手动输入</li>
 *   <li>Filename：文件名</li>
 *   <li>FileType：文件类型</li>
 * </ul>
 */
export type SearchFlag = 'Home' | 'Custom' | 'Input' | 'Filename' | 'FileType';

export const USER_HOME_FOLDER: SearchOption =
  {label: '用户HOME目录', type: 'FullPath', input: `~`, flag: `Home`};

export const DEFAULT_REFINE: SearchOption =
  {label: '文件名', type: 'Is', input: '', flag: 'Filename'};
