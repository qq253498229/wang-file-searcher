import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { ReceiveResult, Search } from './system.action';
import { USER_HOME_FOLDER } from '../../shared/location';
import { invoke } from '@tauri-apps/api/core';
import * as immutable from 'object-path-immutable';

export interface SystemStateModel {
  searchResult: any[];
  searchTextForm: any;
  searchOptionForm: any;
  searchStatus: boolean;
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    searchResult: [],
    searchTextForm: {},
    searchOptionForm: {model: {includes: [USER_HOME_FOLDER]}},
    searchStatus: false,
  },
})
@Injectable({
  providedIn: 'root',
})
export class SystemState implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      searchResult: state.searchResult || [],
      searchForm: state.searchForm || {},
      searchOptionForm: state.searchOptionForm || {model: {includes: [USER_HOME_FOLDER]}},
      searchStatus: state.searchStatus || false,
    });
  }

  @Action(Search)
  Search(ctx: StateContext<SystemStateModel>) {
    ctx.patchState({searchStatus: true});
    let options = {
      text: ctx.getState().searchTextForm.model.text.trim(),
      options: {
        // includes: ctx.getState().searchOptionForm.model.includes,
        includes: [{path: `D:\\src`, path_type: 'FullPath'}],
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
    console.log('options', options);
    invoke('search', {options}).then((result) => {
      console.log('result==', result);
    });
    // return ctx.dispatch([new UpdateFormValue({path: 'system.searchTextForm', value: {text: ''}})]);
  }

  @Action(ReceiveResult)
  receiveResult(ctx: StateContext<SystemStateModel>, {data}: ReceiveResult) {
    console.log('receiveResult==', data);
    let newState = immutable.insert(ctx.getState(),
      ['searchResult'], data.payload);
    console.log('newState==', newState);
    ctx.setState(newState);
  }

}
