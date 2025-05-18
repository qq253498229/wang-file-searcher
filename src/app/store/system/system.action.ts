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

export class ChangeInclude {
  static readonly type = `[system] 改变包含位置选项`;

  constructor(public idx: number, public type: string) {
  }
}

export class ChangeExclude {
  static readonly type = `[system] 改变排除位置选项`;

  constructor(public idx: number, public type: string) {
  }
}

export class RemoveInclude {
  static readonly type = `[system] 移除包含位置选项`;

  constructor(public idx: number) {
  }
}

export class RemoveExclude {
  static readonly type = `[system] 移除排除位置选项`;

  constructor(public idx: number) {
  }
}

export class AddInclude {
  static readonly type = `[system] 添加包含位置选项`;

  constructor(public type: string) {
  }
}

export class AddExclude {
  static readonly type = `[system] 添加排除位置`;
}
