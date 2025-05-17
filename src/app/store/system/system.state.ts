import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { ReceiveResult, Search, StopSearch } from './system.action';
import { USER_HOME_FOLDER } from '../../shared/location';
import { invoke } from '@tauri-apps/api/core';
import * as immutable from 'object-path-immutable';
import { Observable } from 'rxjs';

export interface SystemStateModel {
  result: any[];
  textForm: any;
  optionForm: any;
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
    let options = {
      text: ctx.getState().textForm.model.text.trim(),
      options: {
        // includes: ctx.getState().searchOptionForm.model.includes,
        includes: [{path: `D:\\src\\own\\wang-file-searcher\\src-tauri\\tests`, path_type: 'FullPath'}],
        // includes: [{path: `D:\\src`, path_type: 'FullPath'}],
        excludes: [
          {path: 'target', path_type: 'PartPath'},
          {path: 'node_modules', path_type: 'PartPath'},
          {path: '.idea', path_type: 'PartPath'},
          {path: '.angular', path_type: 'PartPath'},
          {path: '.vscode', path_type: 'PartPath'},
          {path: 'dist', path_type: 'PartPath'},
          // {path: 'yarn.lock', path_type: 'PartPath'},
        ],
      },
    };
    // console.log('options', options);
    invoke('search', {options}).then();
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
