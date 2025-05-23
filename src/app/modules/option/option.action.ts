export class AddOption {
  static readonly type = `[option] 添加搜索位置`;

  constructor(public type: 'includes' | 'excludes' | 'refines', public field: 'label' | 'type' | 'input' | 'flag', public value: string) {
  }
}

export class ChangeOption {
  static readonly type = `[option] 修改搜索位置`;

  constructor(public type: 'includes' | 'excludes' | 'refines', public field: 'label' | 'type' | 'input' | 'flag', public idx: number, public value: string) {
  }
}

export class DeleteOption {
  static readonly type = `[option] 删除搜索位置`;

  constructor(public type: 'includes' | 'excludes' | 'refines', public idx: number) {
  }
}

export class ClearOptions {
  static readonly type = `[option] 清理候选项`;
}

export class ChangeValue {
  static readonly type = `[option] 修改选项值`;

  constructor(public type: 'includes' | 'excludes' | 'refines',
              public field: 'label' | 'type' | 'input' | 'flag',
              public idx: number, public input: string) {
  }
}
