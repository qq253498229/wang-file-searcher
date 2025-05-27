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
