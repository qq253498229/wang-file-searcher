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
