export class InitConfig {
  static readonly type = `[config] 初始化配置`;
}

export class SaveCurrentConfig {
  static readonly type = `[config] 保存当前配置`;
}

export class EditConfigRow {
  static readonly type = `[config] 修改配置行`;

  constructor(public data: any) {
  }
}

export class SaveConfig {
  static readonly type = `[config] 保存修改后的顺序`;

  constructor(public data: any) {
  }
}

export class UseConfig {
  static readonly type = `[config] 使用配置覆盖当前搜索选项`;

  constructor(public data: any) {
  }
}

export class DeleteConfig {
  static readonly type = `[config] 删除配置`;

  constructor(public data: any) {
  }
}

export class ChangeCurrent {
  static readonly type = `[config] 修改当前配置`;

  constructor(public id: string) {
  }
}

export class OpenConfigFolder {
  static readonly type = `[config] 打开配置目录`;
}
