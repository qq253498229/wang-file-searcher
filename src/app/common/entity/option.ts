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
  | 'Is' | 'Not' | 'Contains' | 'NotContains' | 'Begin' | 'End';
/**
 * <ul>
 *   <li>home：用户HOME目录</li>
 *   <li>custom：自定义目录</li>
 *   <li>input：手动输入</li>
 *   <li>filename：文件名</li>
 * </ul>
 */
export type SearchFlag = 'Home' | 'Custom' | 'Input' | 'Filename';

export const USER_HOME_FOLDER: SearchOption =
  {label: '用户HOME目录', type: 'FullPath', input: `~`, flag: `Home`};

export const DEFAULT_REFINE: SearchOption =
  {label: '文件名', type: 'Is', input: '', flag: 'Filename'};
