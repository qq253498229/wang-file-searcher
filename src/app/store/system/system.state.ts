import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { Search } from './system.action';
import { USER_HOME_FOLDER } from '../../shared/location';
import { UpdateFormValue } from '@ngxs/form-plugin';
import { invoke } from '@tauri-apps/api/core';

export interface SystemStateModel {
  searchResult: any[];
  searchTextForm: any;
  searchOptionForm: any;
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    searchResult: [],
    searchTextForm: {},
    searchOptionForm: {model: {includes: [USER_HOME_FOLDER]}},
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
    });
  }

  @Action(Search)
  Search(ctx: StateContext<SystemStateModel>) {
    let options = {
      text: ctx.getState().searchTextForm.model.text.trim(),
      options: {
        includes: ctx.getState().searchOptionForm.model.includes,
      },
    };
    console.log('options', options);
    invoke('search', {options}).then((result) => {
      console.log('result==', result);
    });
    // return ctx.dispatch([new UpdateFormValue({path: 'system.searchTextForm', value: {text: ''}})]);
  }

}
