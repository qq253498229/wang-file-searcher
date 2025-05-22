export class OperationMenu {
  static readonly type = `[system] 打开上下文菜单`;

  constructor(public data: any) {
  }
}

export class OpenFolder {
  static readonly type = `[system] 本地打开目录`;

  constructor(public path: string) {
  }
}
