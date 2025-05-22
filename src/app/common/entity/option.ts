export interface SearchOption {
  /**
   * 显示名称
   */
  label: string;
  type: 'FullPath' | 'PartPath' | 'is';
  input: string;
  /**
   * <ul>
   *   <li>home：用户HOME目录</li>
   *   <li>custom：自定义目录</li>
   *   <li>input：手动输入</li>
   * </ul>
   */
  flag: 'home' | 'custom' | 'input' | 'filename';
}

export const USER_HOME_FOLDER: SearchOption =
  {label: '用户HOME目录', type: 'FullPath', input: `~`, flag: `home`};
export const DEFAULT_REFINE: SearchOption =
  {label: '文件名', type: 'is', input: '', flag: 'filename'};
