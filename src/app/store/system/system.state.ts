import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { Search } from './system.action';
import { invoke } from '@tauri-apps/api/core';

export interface SystemStateModel {
  result: any[];
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    result: [],
  },
})
@Injectable({
  providedIn: 'root',
})
export class SystemState implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({testState: state.testState || 0});
  }

  @Action(Search)
  Search(ctx: StateContext<SystemStateModel>, {text}: Search) {
    console.log('Search==', text);
    invoke('search', {options: {text, path: []}}).then((result) => {
      console.log('result==', result);
    });
  }

}
