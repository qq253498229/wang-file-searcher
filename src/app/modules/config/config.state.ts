import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext, Store } from '@ngxs/store';
import {
  ChangeCurrent,
  CopyConfig,
  DeleteConfig,
  EditConfigRow,
  ImportConfigFromClipboard,
  InitConfig,
  OpenConfigFolder,
  OverrideConfig,
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
import { InitOptions, ResetOptions } from '../option/option.action';
import { UpdateFormValue } from '@ngxs/form-plugin';
import { concatMap, from, map, tap } from 'rxjs';
import { ClearResult } from '../result/result.action';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

export interface ConfigStateModel {
  testNumber: number;
  editForm: any;
  configs: any[];
  current: any;
}

@State<ConfigStateModel>({
  name: 'config',
  defaults: {
    testNumber: 0,
    editForm: {},
    configs: [],
    current: {},
  },
})
@Injectable({
  providedIn: 'root',
})
export class ConfigState implements NgxsOnInit {
  store = inject(Store);
  message = inject(NzMessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      configs: state.configs || [],
      current: state.current || {},
    });
  }

  @Action(SaveCurrentConfig)
  saveCurrentConfig(ctx: StateContext<ConfigStateModel>) {
    let param = this.store.selectSnapshot(OptionSelector.param());
    param.text = this.store.selectSnapshot(SearchSelector.text());
    let id = generateUid();
    let config = {param, id};
    return from(invoke('save_config', {config})).pipe(
      tap(() => this.message.success(`保存成功`)),
      concatMap(() => ctx.dispatch(new InitConfig())),
      concatMap(() => ctx.dispatch(new UseConfig(id))),
    );
  }

  @Action(InitConfig)
  initConfig(ctx: StateContext<ConfigStateModel>) {
    return from(invoke('init_config')).pipe(
      tap((r: any) => ctx.patchState({configs: r})),
    );
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
    return from(invoke('save_config', {config})).pipe(
      tap(() => this.message.success(`保存成功`)),
      concatMap(() => ctx.dispatch(new InitConfig())),
    );
  }

  @Action(UseConfig)
  useConfig(ctx: StateContext<ConfigStateModel>, {data}: UseConfig) {
    if ('' === data) {
      return ctx.dispatch([
        new ResetOptions(),
        new ClearResult(),
        new UpdateFormValue({path: 'search.textForm', value: {text: ''}}),
      ]);
    }
    let config = data;
    if (typeof (data) === 'string') {
      config = ctx.getState().configs.find(s => s.id === data);
    }
    return ctx.dispatch([
      new InitOptions(config.param),
      new UpdateFormValue({path: 'search.textForm', value: {text: config.param.text}}),
      new ChangeCurrent(config.id),
    ]).pipe(tap(() => {
      this.message.success(`配置使用成功`);
    }));
  }

  @Action(DeleteConfig)
  deleteConfig(ctx: StateContext<ConfigStateModel>, {data}: DeleteConfig) {
    return from(invoke('delete_config', {config: data})).pipe(
      tap(() => this.message.success(`删除成功`)),
      concatMap(() => ctx.dispatch(new InitConfig())),
    );
  }

  @Action(OpenConfigFolder)
  openConfigFolder(_ctx: StateContext<ConfigStateModel>) {
    return from(invoke('open_config_folder'));
  }

  @Action(ChangeCurrent)
  changeCurrentConfig(ctx: StateContext<ConfigStateModel>, {id}: ChangeCurrent) {
    let current = ctx.getState().configs.find(s => s.id === id);
    ctx.patchState({current});
  }

  @Action(OverrideConfig)
  overrideConfig(ctx: StateContext<ConfigStateModel>, {data}: OverrideConfig) {
    let idx = ctx.getState().configs.findIndex(s => s.id === data.id);
    let param = this.store.selectSnapshot(OptionSelector.param());
    param.text = this.store.selectSnapshot(SearchSelector.text());
    let newState = immutable.set(ctx.getState(), ['configs', idx, 'param'], param);
    ctx.setState(newState);
    let config = ctx.getState().configs[idx];
    return from(invoke('save_config', {config})).pipe(
      tap(() => this.message.success(`保存成功`)),
      concatMap(() => ctx.dispatch(new InitConfig())),
    );
  }

  @Action(CopyConfig)
  copyConfig(_ctx: StateContext<ConfigStateModel>, {data}: CopyConfig) {
    let json = JSON.stringify(data, null, 2);
    return from(writeText(json)).pipe(
      tap(() => this.message.success(`复制成功`)),
    );
  }

  @Action(ImportConfigFromClipboard)
  importConfigFromClipboard(ctx: StateContext<ConfigStateModel>) {
    return from(readText()).pipe(
      map((text) => {
        try {
          //这里要处理后返回新的对象
          return JSON.parse(text);
        } catch (e) {
          this.message.error(`配置读取失败，不是合法json`);
          throw new Error(`配置读取失败，不是合法json`);
        }
      }),
      tap(config => ctx.dispatch(new SaveConfig(config))),
    );
  }

}
