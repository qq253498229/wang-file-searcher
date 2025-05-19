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
  static readonly type = `[system] 改变位置选项`;

  constructor(public type: string, public input: string) {
  }
}

export class ChangeOption {
  static readonly type = `[system] 添加位置选项`;

  constructor(public type: string, public idx: number, public input: string) {
  }
}

export class DeleteOption {
  static readonly type = `[system] 删除位置选项`;

  constructor(public type: string, public idx: number) {
  }
}
