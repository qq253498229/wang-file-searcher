import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { SystemAction } from './system.action';

export interface SystemStateModel {
  testState: number;
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    testState: 0,
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

  @Action(SystemAction.ChangeTestState)
  ChangeTestState(ctx: StateContext<SystemStateModel>) {
    let state = ctx.getState();
    ctx.patchState({testState: state.testState + 1});
  }

}
