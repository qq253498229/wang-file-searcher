export class Search {
  static readonly type = `[system] 搜索`;
}

export class StopSearch {
  static readonly type = `[system] 停止搜索`;
}

export class ReceiveResult {
  static readonly type = `[system] 接受到搜索结果`;

  constructor(public data: any) {
  }
}

export class AddOption {
  static readonly type = `[system] 添加搜索位置`;

  constructor(public type: 'includes' | 'excludes', public input: string) {
  }
}

export class ChangeOption {
  static readonly type = `[system] 修改搜索位置`;

  constructor(public type: 'includes' | 'excludes', public idx: number, public input: string) {
  }
}

export class DeleteOption {
  static readonly type = `[system] 删除搜索位置`;

  constructor(public type: 'includes' | 'excludes', public idx: number) {
  }
}

export class OperationMenu {
  static readonly type = `[system] 打开上下文菜单`;

  constructor(public data: any) {
  }
}
