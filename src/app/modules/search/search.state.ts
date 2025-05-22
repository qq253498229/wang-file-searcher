import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext, Store } from '@ngxs/store';
import { Search, StopSearch, SwitchSearch } from './search.action';
import { invoke } from '@tauri-apps/api/core';
import { ResultSelector } from '../result/result.selector';
import { OptionSelector } from '../option/option.selector';
import { ClearResult, Start, Stop } from '../result/result.action';

export interface SearchStateModel {
  /**
   * 搜索文本
   */
  textForm: any;
  testNumber: number;
}

@State<SearchStateModel>({
  name: 'search',
  defaults: {
    textForm: {},
    testNumber: 0,
  },
})
@Injectable({
  providedIn: 'root',
})
export class SearchState implements NgxsOnInit {
  store = inject(Store);

  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      textForm: state.textForm || {},
    });
  }

  @Action(Search)
  Search(ctx: StateContext<SearchStateModel>) {
    let includes = this.store.selectSnapshot(OptionSelector.includes());
    let excludes = this.store.selectSnapshot(OptionSelector.excludes());
    let refines = this.store.selectSnapshot(OptionSelector.refines());
    let param = {
      text: ctx.getState().textForm.model.text.trim(),
      includes, excludes, refines,
    };
    invoke('search', {param}).then();
    return ctx.dispatch([new ClearResult(), new Start()]);
  }

  @Action(StopSearch)
  async stopSearch(ctx: StateContext<SearchStateModel>) {
    await invoke('stop_search');
    return ctx.dispatch([new Stop()]);
  }

  @Action(SwitchSearch)
  switchSearch(ctx: StateContext<SearchStateModel>) {
    if (this.store.selectSnapshot(ResultSelector.isStop())) {
      return ctx.dispatch(new Search());
    } else {
      return ctx.dispatch(new StopSearch());
    }
  }

}
