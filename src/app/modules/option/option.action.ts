export class AddOption {
  static readonly type = `[option] 添加搜索位置`;

  constructor(public type: 'includes' | 'excludes' | 'refines', public input: string) {
  }
}

export class ChangeOption {
  static readonly type = `[option] 修改搜索位置`;

  constructor(public type: 'includes' | 'excludes' | 'refines', public idx: number, public input: string) {
  }
}

export class DeleteOption {
  static readonly type = `[option] 删除搜索位置`;

  constructor(public type: 'includes' | 'excludes' | 'refines', public idx: number) {
  }
}

export class ChangeInput {
  static readonly type = `[option] 手动输入路径`;

  constructor(public type: 'includes' | 'excludes' | 'refines', public idx: number, public input: string) {
  }
}
