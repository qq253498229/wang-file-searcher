import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { OpenFolder, OperationMenu } from './system.action';
import { invoke } from '@tauri-apps/api/core';
import { Menu } from '@tauri-apps/api/menu/menu';

export interface SystemStateModel {
  testNumber: number;
}

@State<SystemStateModel>({
  name: 'system',
  defaults: {
    testNumber: 0,
  },
})
@Injectable({
  providedIn: 'root',
})
export class SystemState implements NgxsOnInit {

  ngxsOnInit(ctx: StateContext<any>): void {
    ctx.patchState({});
  }

  @Action(OperationMenu)
  operationMenu(ctx: StateContext<SystemStateModel>, {data}: OperationMenu) {
    Menu.new({
      items: [
        {
          id: 'openFolder', text: '打开本地目录', action: () => {
            ctx.dispatch(new OpenFolder(data.path));
          },
        },
      ],
    }).then(menu => {
      menu.popup().then();
    });
  }

  @Action(OpenFolder)
  openFolder(_ctx: StateContext<SystemStateModel>, {path}: OpenFolder) {
    invoke('open_folder', {path}).then();
  }

}
