import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext, Store } from '@ngxs/store';
import {
  DeleteConfig,
  EditConfigRow,
  InitConfig,
  OpenConfigFolder,
  SaveConfig,
  SaveCurrentConfig,
  UseConfig,
} from './config.action';
import { OptionSelector } from '../option/option.selector';
import { SearchSelector } from '../search/search.selector';
import { invoke } from '@tauri-apps/api/core';
import { generateUid } from '../../common/utils';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as immutable from 'object-path-immutable';
import { InitOptions } from '../option/option.action';
import { UpdateFormValue } from '@ngxs/form-plugin';
import { tap } from 'rxjs';

export interface ConfigStateModel {
  testNumber: number;
  editForm: any;
  configs: any[];
}

@State<ConfigStateModel>({
  name: 'config',
  defaults: {
    testNumber: 0,
    editForm: {},
    configs: [],
  },
})
@Injectable({
  providedIn: 'root',
})
export class ConfigState implements NgxsOnInit {
  store = inject(Store);
  message = inject(NzMessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    ctx.patchState({configs: []});
  }

  @Action(SaveCurrentConfig)
  saveCurrentConfig(ctx: StateContext<ConfigStateModel>) {
    let text = this.store.selectSnapshot(SearchSelector.text());
    let includes = this.store.selectSnapshot(OptionSelector.includes());
    let excludes = this.store.selectSnapshot(OptionSelector.excludes());
    let refines = this.store.selectSnapshot(OptionSelector.refines());
    let param = {text, includes, excludes, refines};
    let config = {param, id: generateUid()};
    invoke('save_config', {config}).then(() => {
      this.message.success(`保存成功`);
      ctx.dispatch(new InitConfig());
    });
  }

  @Action(InitConfig)
  initConfig(ctx: StateContext<ConfigStateModel>) {
    invoke('init_config').then((r: any) => {
      ctx.patchState({configs: r});
    });
  }

  @Action(EditConfigRow)
  editConfigRow(ctx: StateContext<ConfigStateModel>, {data}: EditConfigRow) {
    let idx = ctx.getState().configs.findIndex(s => s.id === data.id);
    let current = ctx.getState().configs[idx];
    let newState = ctx.getState();
    for (let i = 0; i < ctx.getState().configs.length; i++) {
      let c = ctx.getState().configs[i];
      if (c.edit) {
        newState = immutable.set(newState, ['configs', i, 'edit'], false);
      }
    }
    newState = immutable.set(newState, ['configs', idx, 'edit'], !current.edit);
    ctx.setState(newState);
  }

  @Action(SaveConfig)
  saveConfig(ctx: StateContext<ConfigStateModel>, {data}: SaveConfig) {
    let config = data;
    invoke('save_config', {config}).then(() => {
      this.message.success(`保存成功`);
      ctx.dispatch(new InitConfig());
    });
  }

  @Action(UseConfig)
  useConfig(ctx: StateContext<ConfigStateModel>, {data}: UseConfig) {
    return ctx.dispatch([
      new InitOptions(data.param),
      new UpdateFormValue({path: 'search.textForm', value: {text: data.param.text}}),
    ]).pipe(tap(() => {
      this.message.success(`配置使用成功`);
    }));
  }

  @Action(DeleteConfig)
  deleteConfig(ctx: StateContext<ConfigStateModel>, {data}: DeleteConfig) {
    invoke('delete_config', {config: data}).then(() => {
      this.message.success(`删除成功`);
      ctx.dispatch(new InitConfig());
    });
  }

  @Action(OpenConfigFolder)
  openConfigFolder(_ctx: StateContext<ConfigStateModel>) {
    invoke('open_config_folder').then();
  }

}
