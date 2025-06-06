export class OpenFolder {
  static readonly type = `[system] 本地打开目录`;

  constructor(public path: string) {
  }
}

export class InitLanguage {
  static readonly type = `[system] 初始化语言`;
}

export class ChangeLanguage {
  static readonly type = `[system] 改变语言`;

  constructor(public language: string) {
  }
}
