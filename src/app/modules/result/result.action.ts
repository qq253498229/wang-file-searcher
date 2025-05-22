export class ReceiveResult {
  static readonly type = `[result] 接受到搜索结果`;

  constructor(public events: any[]) {
  }
}

export class ReceiveStatus {
  static readonly type = `[result] 接受状态`;

  constructor(public data: any) {
  }
}

export class ClearResult {
  static readonly type = `[result] 清除结果`;
}

export class Start {
  static readonly type = `[result] 开始`;
}

export class Stop {
  static readonly type = `[result] 停止`;
}
