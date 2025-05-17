import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { ReceiveResult, Search, StopSearch } from './system.action';
import { USER_HOME_FOLDER } from '../../shared/location';
import { invoke } from '@tauri-apps/api/core';
import * as immutable from 'object-path-immutable';
import { Observable } from 'rxjs';

export interface SystemStateModel {
  result: any[];
  /**
   * 搜索文本
   */
  textForm: any;
  /**
   * 搜索选项
   */
  optionForm: any;
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
    optionForm: {model: {includes: [USER_HOME_FOLDER]}},
    isStop: true,
  },
})
@Injectable({
  providedIn: 'root',
})
export class SystemState implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      result: [],
      textForm: state.textForm || {},
      optionForm: state.optionForm || {model: {includes: [USER_HOME_FOLDER]}},
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
        {input: `D:\\src\\own\\wang-file-searcher\\src-tauri\\tests`, type: 'FullPath'},
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

}
