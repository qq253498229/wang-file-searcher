export interface SearchOption {
  /**
   * 显示名称
   */
  label: string;
  type: 'FullPath' | 'PartPath';
  input: string;
  /**
   * <ul>
   *   <li>home：用户HOME目录</li>
   *   <li>custom：自定义目录</li>
   * </ul>
   */
  flag: 'home' | 'custom';
}

export const USER_HOME_FOLDER: SearchOption =
  {label: '用户HOME目录', type: 'FullPath', input: `~`, flag: `home`};

export const CUSTOM_INPUT_PATH: SearchOption =
  {label: '手动输入路径', type: 'PartPath', input: ``, flag: `custom`};

export const INCLUDE_OPTIONS: SearchOption[] = [
  USER_HOME_FOLDER,
  CUSTOM_INPUT_PATH,
];
/**
 * 搜索选项
 */
// export const SEARCH_OPTIONS: SearchOption[] = [
//   {label: '用户HOME目录', type: 'FullPath', input: `~`, flag: `home`},
//   // {label: 'Node依赖目录', type: 'PartPath', input: `node_modules`},
//   // {label: 'Java/Rust编译目录', type: 'PartPath', input: `target`},
//   //
//   // {label: 'IDEA配置目录', type: 'PartPath', input: '.idea'},
//   // {label: 'Angular配置目录', type: 'PartPath', input: '.angular'},
//   // {label: 'VSCode配置目录', type: 'PartPath', input: '.vscode'},
//   // {label: 'dist发布目录', type: 'PartPath', input: 'dist'},
//
//   {label: '手动选择目录', type: 'FullPath', input: ``, flag: 'custom'},
//   {label: '手动输入文件名', type: 'PartPath', input: ``},
//   {label: '手动输入路径', type: 'PartPath', input: ``},
// ];
/**
 * 过滤文件类型
 */
// export const FILTER_TYPE: SearchOption[] = [
//   {label: `全部`, type: `all`},
//   {label: `文件夹`, type: `folder`},
//   {label: `图片`, type: `picture`},
//   {label: `视频`, type: `video`},
//   {label: `音频`, type: `audio`},
//   {label: `手动输入`, type: `custom`, input: ``},
// ];
/**
 * 过滤时间
 */
// export const FILTER_TIME = [
//   {label: '全部', type: `all`},
//   {label: '今天', type: '1d'},
//   {label: '7天内', type: '7d'},
//   {label: '30天内', type: '30d'},
//   {label: '今年', type: '1y'},
//   {label: '手动输入', type: 'custom', input: ''},
// ];
