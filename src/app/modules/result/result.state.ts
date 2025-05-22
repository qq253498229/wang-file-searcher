import {inject, Injectable} from '@angular/core';
import {Action, NgxsOnInit, State, StateContext} from '@ngxs/store';
import {Observable} from 'rxjs';
import * as immutable from 'object-path-immutable';
import {NzMessageService} from 'ng-zorro-antd/message';
import {StopSearch} from '../search/search.action';
import {ClearResult, ReceiveResult, ReceiveStatus, Start, Stop} from './result.action';

export interface ResultStateModel {
  /**
   * 搜索结果
   */
  result: any[];
  /**
   * 搜索是否结束
   */
  isStop: boolean;
  statusPath: string;
  statusTime: number;
  searchStartTime: number;
}

@State<ResultStateModel>({
  name: 'result',
  defaults: {
    result: [],
    isStop: true,
    statusPath: ``,
    statusTime: 0,
    searchStartTime: 0,
  },
})
@Injectable({
  providedIn: 'root',
})
export class ResultState implements NgxsOnInit {
  message = inject(NzMessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    let state = ctx.getState();
    ctx.patchState({
      result: state.result || [],
      isStop: true,
      statusPath: ``,
      statusTime: 0,
      searchStartTime: 0,
    });
  }

  @Action(ReceiveResult)
  receiveResult(ctx: StateContext<ResultStateModel>, {events}: ReceiveResult): Observable<any> | void {
    let newState = ctx.getState();
    for (let e of events) {
      if (e.payload.is_done) continue;
      newState = immutable.push(newState, ['result'], e.payload);
    }
    ctx.setState(newState);
    if (ctx.getState().result.length > 10000) {
      return ctx.dispatch(new StopSearch());
    }
  }

  @Action(ReceiveStatus)
  receiveStatus(ctx: StateContext<ResultStateModel>, {data}: ReceiveStatus): Observable<any> | void {
    if (!!data.payload && data.payload.is_done) {
      let statusTime = new Date().getTime();
      ctx.patchState({statusTime, statusPath: '0'});
      this.message.success(`搜索完成`);
      return ctx.dispatch(new StopSearch());
    } else if (!!data.payload && !!data.payload.path) {
      let oldTime = ctx.getState().statusTime;
      let statusTime = new Date().getTime();
      if ((statusTime - oldTime) < 300) {
        return;
      }
      let statusPath = data.payload.path;
      ctx.patchState({statusPath, statusTime});
    }
  }

  @Action(ClearResult)
  clearResult(ctx: StateContext<ResultStateModel>) {
    ctx.patchState({result: []});
  }

  @Action(Stop)
  stop(ctx: StateContext<ResultStateModel>) {
    ctx.patchState({isStop: true});
  }

  @Action(Start)
  start(ctx: StateContext<ResultStateModel>) {
    let searchStartTime = new Date().getTime();
    ctx.patchState({isStop: false, searchStartTime});
  }

}
