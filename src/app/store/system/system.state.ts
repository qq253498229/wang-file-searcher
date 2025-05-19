import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { AddOption, ChangeOption, DeleteOption, ReceiveResult, Search, StopSearch } from './system.action';
import { INCLUDE_OPTIONS, USER_HOME_FOLDER } from '../../shared/location';
import { invoke } from '@tauri-apps/api/core';
import * as immutable from 'object-path-immutable';
import { Observable } from 'rxjs';
import { open } from '@tauri-apps/plugin-dialog';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface SystemStateModel {
  /**
   * 搜索结果
   */
  result: any[];
  /**
   * 搜索文本
   */
  textForm: any;
  /**
   * 搜索选项
   */
  includes: any;
  includeOptions: any;
  /**
   * 排除选项
   */
  excludes: any;
  excludeOptions: any;
  /**
   * 搜索是否结束
   */
  isStop: boolean;
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    result: [],
    textForm: {},
    includes: [USER_HOME_FOLDER],
    includeOptions: [],
    excludes: [],
    excludeOptions: [],
    isStop: true,
  },
})
@Injectable({
  providedIn: 'root',
})
export class SystemState implements NgxsOnInit {
  message = inject(NzMessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      result: [],
      textForm: state.textForm || {},
      includes: state.includes || [USER_HOME_FOLDER],
      includeOptions: state.includeOptions || INCLUDE_OPTIONS,
      excludes: state.excludes || [],
      excludeOptions: state.excludeOptions || [],
      isStop: state.isStop || true,
    });
  }

  @Action(Search)
  Search(ctx: StateContext<SystemStateModel>) {
    ctx.patchState({isStop: false, result: []});
    let param = {
      text: ctx.getState().textForm.model.text.trim(),
      // includes: ctx.getState().searchOptionForm.model.includes,
      includes: [
        {input: `/Users/wangbin/src/own/wang-file-searcher/wang-file-searcher/src-tauri/tests`, type: 'FullPath'},
        // {input: `D:\\src\\own\\wang-file-searcher\\src-tauri\\tests`, type: 'FullPath'},
      ],
      // includes: [{input: `D:\\src`, type: 'FullPath'}],
      excludes: [
        {input: 'target', type: 'PartPath'},
        {input: 'node_modules', type: 'PartPath'},
        {input: '.idea', type: 'PartPath'},
        {input: '.angular', type: 'PartPath'},
        {input: '.vscode', type: 'PartPath'},
        {input: 'dist', type: 'PartPath'},
        // {input: 'yarn.lock', type: 'PartPath'},
      ],
    };
    // console.log('options', options);
    invoke('search', {param}).then();
    // return ctx.dispatch([new UpdateFormValue({path: 'system.textForm', value: {text: ''}})]);
  }

  @Action(ReceiveResult)
  receiveResult(ctx: StateContext<SystemStateModel>, {data}: ReceiveResult): Observable<any> | void {
    let path = data.payload.path;
    if (ctx.getState().result.findIndex(s => s.path === path) !== -1) {
      return;
    }
    if (ctx.getState().result.length > 10000) {
      return ctx.dispatch(new StopSearch());
    }
    let newState = immutable.push(ctx.getState(), ['result'], data.payload);
    ctx.setState(newState);
  }

  @Action(StopSearch)
  async stopSearch(ctx: StateContext<SystemStateModel>) {
    await invoke('stop_search');
    ctx.patchState({isStop: true});
  }

  @Action(AddOption)
  addOption(ctx: StateContext<SystemStateModel>, {type, input}: AddOption) {
    // input:'' 选择
    // input:'home' 用户HOME目录
    console.log('addOption', type, input);
    let findIndex = ctx.getState().includes.findIndex((s: any, idx: number) => true);
    if (input === '') {
      open({multiple: false, directory: true}).then((r) => {
        this.addOptionWithCheck(r);
      });
      return;
    }
  }

  addOptionWithCheck(r: string | null) {
    // 如果是空值，说明取消了选择框，那么需要先设置成别的值然后再改回来，否则select值会改变
    // 如果有值，则判断是否合法
    // 兜底，最后添加选项
    if (!r) return;
    console.log('r', r);
  }

  @Action(ChangeOption)
  changeOption(ctx: StateContext<SystemStateModel>, {type, idx, input}: ChangeOption) {
    console.log('changeOption', type, idx, input);
  }

  @Action(DeleteOption)
  deleteOption(ctx: StateContext<SystemStateModel>, {type, idx}: DeleteOption) {
    console.log('deleteOption', type, idx);
  }


}
